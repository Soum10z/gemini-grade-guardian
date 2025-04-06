
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract the JWT token from the header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token or user not found' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if the request body is valid JSON
    const requestData = await req.json();
    
    const { subject, studentPerformanceData } = requestData;
    
    if (!subject) {
      return new Response(
        JSON.stringify({ error: 'Subject is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user is a teacher by checking their profile
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profileData || profileData.role !== 'teacher') {
      return new Response(
        JSON.stringify({ error: 'Only teachers can generate lesson plans' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Here we would normally call an external AI API like OpenAI to generate the lesson plan
    // For demonstration purposes, we'll create a simple mock lesson plan
    const lessonPlan = generateMockLessonPlan(subject, studentPerformanceData);

    // Insert the lesson plan into the database
    const { data: insertData, error: insertError } = await supabaseClient
      .from('lesson_plans')
      .insert({
        teacher_id: user.id,
        subject,
        title: `${subject} Lesson Plan`,
        content: lessonPlan,
        student_performance_data: studentPerformanceData || null
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('Error inserting lesson plan:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save lesson plan' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: insertData }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Mock function to generate a lesson plan (in a real app, this would call an AI API)
function generateMockLessonPlan(subject: string, performanceData: any): string {
  const subjectTopics: Record<string, string[]> = {
    'math': ['Algebra', 'Geometry', 'Calculus', 'Statistics'],
    'english': ['Grammar', 'Literature', 'Writing', 'Comprehension'],
    'science': ['Biology', 'Chemistry', 'Physics', 'Earth Science'],
    'history': ['Ancient History', 'World Wars', 'Cultural Movements', 'Political Systems'],
    'computer science': ['Programming', 'Data Structures', 'Algorithms', 'Web Development']
  };

  const topics = subjectTopics[subject.toLowerCase()] || ['Topic 1', 'Topic 2', 'Topic 3'];
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  
  // Analyze performance data if available
  let focusArea = '';
  if (performanceData && performanceData.weakAreas && performanceData.weakAreas.length > 0) {
    focusArea = `Based on student performance data, this lesson will focus particularly on improving skills in: ${performanceData.weakAreas.join(', ')}.`;
  }

  return `# ${subject} Lesson Plan: ${randomTopic}

## Lesson Objectives
- Understand the core concepts of ${randomTopic}
- Apply ${randomTopic} principles to solve real-world problems
- Develop critical thinking skills through ${subject.toLowerCase()} challenges

${focusArea}

## Lesson Structure (60 minutes)

### 1. Introduction (10 minutes)
- Brief overview of ${randomTopic}
- Connect to previous knowledge and real-world applications
- Set clear expectations for the lesson

### 2. Direct Instruction (15 minutes)
- Present key concepts of ${randomTopic}
- Provide visual aids and examples
- Check for understanding through quick questions

### 3. Guided Practice (20 minutes)
- Work through example problems as a class
- Gradually release responsibility to students
- Provide immediate feedback and support

### 4. Independent Practice (10 minutes)
- Students work individually or in pairs on practice problems
- Teacher circulates to provide individualized support
- Differentiated tasks based on student readiness

### 5. Closure (5 minutes)
- Summarize key takeaways from the lesson
- Preview upcoming content
- Exit ticket assessment

## Resources and Materials
- Digital presentation slides
- Student worksheets
- Online interactive tools
- Assessment rubrics

## Assessment Strategy
- Formative assessment through questioning and observation
- Exit ticket to gauge individual understanding
- Homework assignment for extended practice

## Differentiation Strategies
- Provide scaffolded worksheets for struggling students
- Extension activities for advanced learners
- Visual supports for visual learners
- Collaborative options for interpersonal learners

## Homework/Follow-up
- Practice problems related to ${randomTopic}
- Preparation reading for next lesson
- Real-world application project
`;
}
