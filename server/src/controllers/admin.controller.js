import { z } from 'zod';
import supabase from '../config/supabase.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { indexTopicChunks } from '../services/embedding.service.js';

// --- Zod Validation Schemas ---

export const subjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().default('')
});

export const resourceItemSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Resource title is required'),
  type: z.enum(['video', 'article', 'pdf', 'link']),
  url: z.string().min(1, 'Resource URL is required')
});

export const topicSchema = z.object({
  subject_id: z.string().uuid('Valid subject ID is required'),
  title: z.string().min(1, 'Title is required'),
  content: z.string().default(''),
  difficulty: z.coerce.number().int().min(1).max(3).default(1),
  position: z.coerce.number().int().default(0),
  resources: z.array(resourceItemSchema).optional().default([])
});

// --- Subject CRUD ---

export const getAdminSubjects = asyncHandler(async (req, res) => {
  const { data: subjects, error: subjErr } = await supabase
    .from('subjects')
    .select('*, topics(count)')
    .order('created_at', { ascending: false });

  if (subjErr) throw new AppError(subjErr.message, 500);

  const formatted = (subjects || []).map(s => ({
    id: s.id,
    title: s.title,
    description: s.description,
    createdAt: s.created_at,
    topicCount: s.topics?.[0]?.count || 0
  }));

  res.json(formatted);
});

export const createSubject = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  const { data, error } = await supabase
    .from('subjects')
    .insert({ title, description })
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  res.status(201).json(data);
});

export const updateSubject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  const { data, error } = await supabase
    .from('subjects')
    .update({ title, description })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  if (!data) throw new AppError('Subject not found', 404);

  res.json(data);
});

export const deleteSubject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('subjects')
    .delete()
    .eq('id', id);

  if (error) throw new AppError(error.message, 500);
  res.json({ message: 'Subject deleted successfully' });
});

// --- Topic CRUD ---

export const getAdminTopics = asyncHandler(async (req, res) => {
  const { subjectId } = req.query;

  let query = supabase
    .from('topics')
    .select(`
      id,
      subject_id,
      title,
      difficulty,
      position,
      created_at,
      subjects:subject_id (
        id,
        title
      ),
      resources (
        id,
        title,
        type,
        url
      )
    `)
    .order('position', { ascending: true })
    .order('created_at', { ascending: false });

  if (subjectId) {
    query = query.eq('subject_id', subjectId);
  }

  const { data, error } = await query;
  if (error) throw new AppError(error.message, 500);

  const formatted = (data || []).map(t => ({
    id: t.id,
    subjectId: t.subject_id,
    subjectTitle: t.subjects?.title || 'Unknown',
    title: t.title,
    difficulty: t.difficulty,
    position: t.position,
    createdAt: t.created_at,
    resourcesCount: t.resources?.length || 0
  }));

  res.json(formatted);
});

export const getAdminTopicById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: topic, error: topErr } = await supabase
    .from('topics')
    .select(`
      id,
      subject_id,
      title,
      content,
      difficulty,
      position,
      created_at,
      resources (
        id,
        title,
        type,
        url
      )
    `)
    .eq('id', id)
    .single();

  if (topErr || !topic) throw new AppError('Topic not found', 404);

  res.json({
    id: topic.id,
    subjectId: topic.subject_id,
    title: topic.title,
    content: topic.content,
    difficulty: topic.difficulty,
    position: topic.position,
    createdAt: topic.created_at,
    resources: topic.resources || []
  });
});

export const createTopic = asyncHandler(async (req, res) => {
  const { subject_id, title, content, difficulty, position, resources } = req.body;

  // 1. Insert Topic
  const { data: newTopic, error: topErr } = await supabase
    .from('topics')
    .insert({
      subject_id,
      title,
      content: content || '',
      difficulty: difficulty ?? 1,
      position: position ?? 0
    })
    .select()
    .single();

  if (topErr) throw new AppError(topErr.message, 500);

  // 2. Insert Resources if any
  if (resources && resources.length > 0) {
    const resourceRows = resources.map(r => ({
      topic_id: newTopic.id,
      title: r.title,
      type: r.type,
      url: r.url
    }));
    const { error: resErr } = await supabase.from('resources').insert(resourceRows);
    if (resErr) throw new AppError(resErr.message, 500);
  }

  // 3. Auto-chunk and index in content_chunks (runs in background)
  if (content) {
    indexTopicChunks(supabase, newTopic.id, content).catch(err => {
      console.warn('Background chunking failed:', err.message);
    });
  }

  res.status(201).json(newTopic);
});

export const updateTopic = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { subject_id, title, content, difficulty, position, resources } = req.body;

  // 1. Update Topic
  const { data: updatedTopic, error: topErr } = await supabase
    .from('topics')
    .update({
      subject_id,
      title,
      content: content || '',
      difficulty: difficulty ?? 1,
      position: position ?? 0
    })
    .eq('id', id)
    .select()
    .single();

  if (topErr) throw new AppError(topErr.message, 500);
  if (!updatedTopic) throw new AppError('Topic not found', 404);

  // 2. Replace Resources
  await supabase.from('resources').delete().eq('topic_id', id);

  if (resources && resources.length > 0) {
    const resourceRows = resources.map(r => ({
      topic_id: id,
      title: r.title,
      type: r.type,
      url: r.url
    }));
    const { error: resErr } = await supabase.from('resources').insert(resourceRows);
    if (resErr) throw new AppError(resErr.message, 500);
  }

  // 3. Re-chunk and re-embed content
  if (content) {
    indexTopicChunks(supabase, id, content).catch(err => {
      console.warn('Background re-chunking failed:', err.message);
    });
  }

  res.json(updatedTopic);
});

export const deleteTopic = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('topics')
    .delete()
    .eq('id', id);

  if (error) throw new AppError(error.message, 500);
  res.json({ message: 'Topic deleted successfully' });
});

export const reindexTopic = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: topic, error: topErr } = await supabase
    .from('topics')
    .select('id, content')
    .eq('id', id)
    .single();

  if (topErr || !topic) throw new AppError('Topic not found', 404);

  await indexTopicChunks(supabase, topic.id, topic.content);
  res.json({ message: 'Topic re-indexed successfully' });
});

// --- Admin Stats ---

export const getAdminStats = asyncHandler(async (req, res) => {
  const [
    { count: subjectsCount },
    { count: topicsCount },
    { count: questionsCount },
    { count: usersCount }
  ] = await Promise.all([
    supabase.from('subjects').select('*', { count: 'exact', head: true }),
    supabase.from('topics').select('*', { count: 'exact', head: true }),
    supabase.from('questions').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true })
  ]);

  res.json({
    subjectsCount: subjectsCount || 0,
    topicsCount: topicsCount || 0,
    questionsCount: questionsCount || 0,
    usersCount: usersCount || 0
  });
});

// --- Question Schema & CRUD ---

export const questionSchema = z.object({
  question: z.string().min(1, 'Question text is required'),
  options: z.array(z.string().min(1, 'Option text cannot be empty')).min(2, 'At least 2 options are required').max(6),
  correct_index: z.coerce.number().int().min(0),
  explanation: z.string().optional().default('')
}).refine(data => data.correct_index < data.options.length, {
  message: 'Correct option index must be within the range of options',
  path: ['correct_index']
});

export const getTopicQuestions = asyncHandler(async (req, res) => {
  const { id: topicId } = req.params;

  const { data: questions, error } = await supabase
    .from('questions')
    .select('*')
    .eq('topic_id', topicId);

  if (error) throw new AppError(error.message, 500);

  res.json(questions || []);
});

export const createTopicQuestion = asyncHandler(async (req, res) => {
  const { id: topicId } = req.params;
  const { question, options, correct_index, explanation } = req.body;

  const { data, error } = await supabase
    .from('questions')
    .insert({
      topic_id: topicId,
      question,
      options,
      correct_index,
      explanation: explanation || ''
    })
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);

  res.status(201).json(data);
});

export const updateQuestion = asyncHandler(async (req, res) => {
  const { id: questionId } = req.params;
  const { question, options, correct_index, explanation } = req.body;

  const { data, error } = await supabase
    .from('questions')
    .update({
      question,
      options,
      correct_index,
      explanation: explanation || ''
    })
    .eq('id', questionId)
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  if (!data) throw new AppError('Question not found', 404);

  res.json(data);
});

export const deleteQuestion = asyncHandler(async (req, res) => {
  const { id: questionId } = req.params;

  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId);

  if (error) throw new AppError(error.message, 500);

  res.json({ message: 'Question deleted successfully' });
});

export const generateTopicQuestions = asyncHandler(async (req, res) => {
  const { id: topicId } = req.params;
  const count = Math.min(10, Math.max(1, parseInt(req.body.count || '5', 10)));

  // 1. Fetch topic notes
  const { data: topic, error: topErr } = await supabase
    .from('topics')
    .select('id, title, content')
    .eq('id', topicId)
    .single();

  if (topErr || !topic) throw new AppError('Topic not found', 404);

  let topicNotes = topic.content ? topic.content.trim() : '';

  // 1b. If topic notes are empty, auto-extract from uploaded PDF resources if available
  if (topicNotes.length < 25) {
    const { data: pdfResources } = await supabase
      .from('resources')
      .select('*')
      .eq('topic_id', topicId)
      .eq('type', 'pdf');

    if (pdfResources && pdfResources.length > 0) {
      for (const resItem of pdfResources) {
        try {
          const resp = await fetch(resItem.url);
          if (resp.ok) {
            const arrayBuf = await resp.arrayBuffer();
            const buffer = Buffer.from(arrayBuf);
            let extracted = '';

            try {
              const { PDFParse } = await import('pdf-parse');
              const parser = new PDFParse({ data: buffer });
              const parseResult = await parser.getText();
              extracted = parseResult.text ? parseResult.text.trim() : '';
            } catch (pErr) {
              console.warn('PDFParse failed on attached resource:', pErr.message);
            }

            // Fallback to multimodal Gemini if PDF text is sparse/scanned
            const { default: cfg } = await import('../config/env.js');
            const { default: getAi } = await import('../config/gemini.js');
            const aiClient = getAi();

            if (aiClient && cfg.gemini.apiKey) {
              if (extracted.length < 50) {
                try {
                  const aiResp = await aiClient.models.generateContent({
                    model: cfg.gemini.model || 'gemini-3.5-flash-lite',
                    contents: [
                      {
                        inlineData: {
                          mimeType: 'application/pdf',
                          data: buffer.toString('base64')
                        }
                      },
                      `Analyze this document titled "${topic.title}" and extract comprehensive curriculum notes and concepts for college examination prep.`
                    ]
                  });
                  if (aiResp?.text) extracted = aiResp.text.trim();
                } catch (mErr) {
                  console.warn('Gemini multimodal fallback failed:', mErr.message);
                }
              }
            }

            if (extracted.length >= 25) {
              topicNotes = extracted;
              await supabase.from('topics').update({ content: topicNotes }).eq('id', topicId);
              indexTopicChunks(supabase, topicId, topicNotes).catch(e => console.warn('Background chunking failed:', e.message));
              break;
            }
          }
        } catch (fetchErr) {
          console.warn('Could not extract text from resource PDF:', fetchErr.message);
        }
      }
    }
  }

  if (topicNotes.length < 25) {
    throw new AppError('This topic has insufficient notes. Please add notes or upload a PDF first to generate questions.', 400);
  }

  // 2. Call Gemini
  const { default: config } = await import('../config/env.js');
  const { default: getGeminiClient } = await import('../config/gemini.js');

  const ai = getGeminiClient();
  if (!ai || !config.gemini.apiKey) {
    throw new AppError('GEMINI_API_KEY is not configured on the server', 500);
  }

  const prompt = `You are an expert college professor designing multiple-choice examination questions for students.
Topic Title: "${topic.title}"

Topic Notes / Curriculum:
${topicNotes.slice(0, 10000)}

Task:
Generate exactly ${count} distinct, conceptual, multiple-choice questions based strictly on the topic content above.
For each question, provide:
1. "question": the question text (clear and unambiguous).
2. "options": an array of exactly 4 choices (A, B, C, D). Ensure plausible distractors.
3. "correct_index": integer (0, 1, 2, or 3) indicating which option is correct.
4. "explanation": a concise educational explanation of why the correct option is right.

Respond ONLY with valid JSON in this exact structure:
{
  "questions": [
    {
      "question": "What is...",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correct_index": 0,
      "explanation": "Because..."
    }
  ]
}`;

  let questions = [];
  try {
    const response = await ai.models.generateContent({
      model: config.gemini.model || 'gemini-3.5-flash-lite',
      contents: prompt
    });

    let rawText = response.text ? response.text.trim() : '';
    // Strip markdown fences
    rawText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();

    const parsed = JSON.parse(rawText);
    questions = Array.isArray(parsed) ? parsed : (parsed.questions || []);
  } catch (err) {
    throw new AppError(`AI question generation failed: ${err.message}`, 500);
  }

  if (questions.length === 0) {
    throw new AppError('AI did not return any valid questions', 500);
  }

  // 3. Format and validate rows
  const rowsToInsert = [];
  for (const q of questions) {
    if (q.question && Array.isArray(q.options) && q.options.length >= 2) {
      const cIndex = typeof q.correct_index === 'number' && q.correct_index >= 0 && q.correct_index < q.options.length
        ? q.correct_index
        : 0;

      rowsToInsert.push({
        topic_id: topicId,
        question: q.question.trim(),
        options: q.options.map(o => String(o).trim()),
        correct_index: cIndex,
        explanation: q.explanation ? String(q.explanation).trim() : ''
      });
    }
  }

  if (rowsToInsert.length === 0) {
    throw new AppError('Generated questions failed validation structure', 500);
  }

  // 4. Save to database
  const { data: inserted, error: insertErr } = await supabase
    .from('questions')
    .insert(rowsToInsert)
    .select();

  if (insertErr) throw new AppError(insertErr.message, 500);

  res.status(201).json({
    message: `Successfully generated and saved ${inserted.length} questions!`,
    questions: inserted
  });
});

export const uploadPdf = asyncHandler(async (req, res) => {
  const { fileName, fileBase64, contentType } = req.body;

  if (!fileName || !fileBase64) {
    throw new AppError('File name and base64 content are required', 400);
  }

  // Sanitize file name
  const cleanBaseName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `pdfs/${Date.now()}_${cleanBaseName}`;

  // Strip possible data URI scheme prefix
  const rawBase64 = fileBase64.replace(/^data:application\/pdf;base64,/, '');
  const buffer = Buffer.from(rawBase64, 'base64');

  // 1. Upload to Supabase Storage 'resources' bucket
  const { error: uploadError } = await supabase.storage
    .from('resources')
    .upload(storagePath, buffer, {
      contentType: contentType || 'application/pdf',
      upsert: true
    });

  if (uploadError) {
    throw new AppError(`Storage upload failed: ${uploadError.message}`, 500);
  }

  // Generate public download/view URL
  const { data: urlData } = supabase.storage
    .from('resources')
    .getPublicUrl(storagePath);

  const publicUrl = urlData?.publicUrl || '';
  const title = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

  // 2. Extract Text from the PDF using pdf-parse v2
  let extractedText = '';
  try {
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: buffer });
    const parsed = await parser.getText();
    extractedText = parsed.text ? parsed.text.trim() : '';
  } catch (parseErr) {
    console.warn('Could not parse text from PDF with PDFParse:', parseErr.message);
  }

  // 3. Synthesize / Structure Concepts using Gemini (if key is set)
  let structuredNotes = extractedText;
  const { default: config } = await import('../config/env.js');
  const { default: getGeminiClient } = await import('../config/gemini.js');

  if (config.gemini.apiKey) {
    const ai = getGeminiClient();
    if (ai) {
      const model = config.gemini.model || 'gemini-3.5-flash-lite';
      if (extractedText.length >= 50) {
        try {
          const prompt = `You are an expert college professor. Below is the text extracted from a study PDF titled "${title}".
Analyze the content and generate structured, comprehensive study notes suitable for college students:
1. Core Definitions & Objectives
2. Key Concepts, Rules & Mechanism (explained step-by-step)
3. Concrete Examples or Code (if applicable)
4. Summary & Important Points to Remember

Output clean, well-formatted plain text with clear headings and bullet points. Do not include markdown code fence wrappers like \`\`\`markdown.

Extracted PDF Content:
${extractedText.slice(0, 12000)}`;

          const response = await ai.models.generateContent({
            model,
            contents: prompt
          });

          if (response?.text) {
            structuredNotes = response.text.trim();
          }
        } catch (aiErr) {
          console.warn('Gemini concept structuring failed, using raw extracted text:', aiErr.message);
        }
      } else {
        // Fallback to multimodal inline PDF reading for scanned documents or image slides
        try {
          const prompt = `You are an expert college professor. Below is a study document titled "${title}".
Read the entire document thoroughly and generate detailed, comprehensive study notes for college students:
1. Core Definitions & Objectives
2. Key Concepts, Rules & Mechanisms (explained step-by-step)
3. Important Questions, Formulas, or Code (if present in the document)
4. Summary & High-Yield Examination Points

Write clear, structured notes with headings and bullet points.`;

          const response = await ai.models.generateContent({
            model,
            contents: [
              {
                inlineData: {
                  mimeType: 'application/pdf',
                  data: rawBase64
                }
              },
              prompt
            ]
          });

          if (response?.text) {
            structuredNotes = response.text.trim();
          }
        } catch (aiMultimodalErr) {
          console.warn('Gemini multimodal extraction failed:', aiMultimodalErr.message);
        }
      }
    }
  }

  res.json({
    url: publicUrl,
    fileName,
    title,
    path: storagePath,
    extractedNotes: structuredNotes || extractedText || ''
  });
});
