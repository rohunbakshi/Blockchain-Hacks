/**
 * Resume Parser using AI
 * Extracts text from resume files and uses AI to parse structured information
 */

export interface ParsedResume {
  firstName?: string;
  lastName?: string;
  age?: string;
  gender?: string;
  email?: string;
  phone?: string;
  address?: string;
  workExperience?: Array<{
    company: string;
    position: string;
    duration: string;
    description?: string;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    field: string;
    year?: string;
  }>;
  skills?: string[];
  summary?: string;
}

/**
 * Extract text from PDF file
 * Uses pdf.js library which is browser-compatible
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        console.log('PDF file loaded, size:', arrayBuffer.byteLength, 'bytes');
        
        // Dynamic import for pdfjs-dist (PDF.js for browsers)
        console.log('Importing PDF.js library...');
        // Import PDF.js from the build directory
        const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');
        
        // Set worker path for PDF.js - use local worker file from public folder
        if (typeof window !== 'undefined') {
          // Use worker file from public folder (served by Vite)
          pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
          console.log('PDF.js worker configured:', pdfjsLib.GlobalWorkerOptions.workerSrc);
        }
        
        console.log('Loading PDF document...');
        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument({ 
          data: arrayBuffer,
          useSystemFonts: true,
        });
        const pdf = await loadingTask.promise;
        console.log('PDF loaded, pages:', pdf.numPages);
        
        // Extract text from all pages
        let fullText = '';
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          console.log(`Extracting text from page ${pageNum}...`);
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          // Combine all text items from the page
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          fullText += pageText + '\n';
        }
        
        console.log('PDF parsed successfully, extracted text length:', fullText.length);
        
        if (!fullText || fullText.trim().length === 0) {
          console.warn('PDF parsed but no text extracted. This might be a scanned/image-based PDF.');
          reject(new Error('No text found in PDF. The PDF might be image-based or scanned. Please use a text-based PDF or DOC/DOCX file.'));
          return;
        }
        
        resolve(fullText.trim());
      } catch (error: any) {
        console.error('PDF parsing error:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
        
        // Provide more helpful error messages
        if (error.message?.includes('Invalid PDF') || error.message?.includes('corrupted')) {
          reject(new Error('Invalid or corrupted PDF file. Please try a different PDF file.'));
        } else if (error.message?.includes('password')) {
          reject(new Error('This PDF is password-protected. Please remove the password and try again.'));
        } else {
          reject(new Error(`Failed to parse PDF: ${error.message || 'Unknown error'}. Please try uploading a DOC/DOCX file instead.`));
        }
      }
    };
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      reject(new Error('Failed to read PDF file. Please try again.'));
    };
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Extract text from DOC/DOCX file
 */
export async function extractTextFromDOC(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        // Dynamic import for mammoth
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ arrayBuffer });
        resolve(result.value);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Extract text from image file (basic OCR placeholder)
 * Note: For production, you'd want to use a proper OCR service like Tesseract.js or cloud OCR
 */
export async function extractTextFromImage(file: File): Promise<string> {
  // For now, return empty string
  // In production, implement OCR using Tesseract.js or cloud service
  return '';
}

/**
 * Extract text from resume file based on file type
 */
export async function extractTextFromResume(file: File): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return extractTextFromPDF(file);
  } else if (
    fileType === 'application/msword' ||
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.doc') ||
    fileName.endsWith('.docx')
  ) {
    return extractTextFromDOC(file);
  } else if (fileType.startsWith('image/')) {
    return extractTextFromImage(file);
  } else {
    throw new Error('Unsupported file type. Please upload PDF, DOC, DOCX, or image files.');
  }
}

/**
 * Parse resume text using AI (OpenAI API)
 * This function uses OpenAI to extract structured information from resume text
 */
export async function parseResumeWithAI(resumeText: string): Promise<ParsedResume> {
  try {
    // Check if OpenAI API key is available
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    console.log('Checking for OpenAI API key...', apiKey ? 'Found' : 'Not found');
    
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      console.warn('OpenAI API key not configured, using fallback parsing');
      // If no API key, use fallback parsing with regex patterns
      return parseResumeFallback(resumeText);
    }

    console.log('Sending resume text to OpenAI API...', `Text length: ${resumeText.length} characters`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using cheaper model for resume parsing
        messages: [
          {
            role: 'system',
            content: `You are a resume parser. Extract structured information from resume text and return ONLY a valid JSON object with this exact structure:
{
  "firstName": "string or null",
  "lastName": "string or null",
  "age": "string or null (calculate from date of birth or experience if available)",
  "gender": "string or null (male, female, non-binary, or null if not found)",
  "email": "string or null",
  "phone": "string or null",
  "address": "string or null",
  "workExperience": [{"company": "string", "position": "string", "duration": "string", "description": "string or null"}],
  "education": [{"institution": "string", "degree": "string", "field": "string", "year": "string or null"}],
  "skills": ["string"],
  "summary": "string or null"
}

IMPORTANT: Return ONLY the JSON object, no markdown formatting, no code blocks, no additional text. Just the raw JSON object.`,
          },
          {
            role: 'user',
            content: `Parse this resume and extract all information:\n\n${resumeText.substring(0, 8000)}`, // Limit text length to avoid token limits
          },
        ],
        temperature: 0.2,
        max_tokens: 2000,
        response_format: { type: 'json_object' }, // Request JSON format explicitly
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error response:', errorData);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
    }

    const data = await response.json();
    console.log('OpenAI API response received:', data);
    
    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.error('No content in AI response:', data);
      throw new Error('No content received from AI');
    }

    console.log('AI response content:', content);

    // Try to parse JSON directly first
    let parsed: ParsedResume;
    try {
      parsed = JSON.parse(content) as ParsedResume;
    } catch (parseError) {
      // If direct parse fails, try to extract JSON from markdown or code blocks
      console.warn('Direct JSON parse failed, trying to extract from response...');
      
      // Remove markdown code blocks if present
      let jsonText = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Extract JSON object from text
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }
      
      parsed = JSON.parse(jsonMatch[0]) as ParsedResume;
    }

    console.log('Parsed resume data:', parsed);
    
    // Validate that we got some useful data
    if (!parsed.firstName && !parsed.lastName && !parsed.email) {
      console.warn('Parsed data seems empty, falling back to regex parsing');
      // If we didn't get meaningful data, fall back to regex
      const fallback = parseResumeFallback(resumeText);
      // Merge fallback with AI results
      return { ...fallback, ...parsed };
    }

    return parsed;
  } catch (error: any) {
    console.error('AI parsing error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
    });
    
    // Fallback to regex-based parsing if AI fails
    console.log('Falling back to regex-based parsing...');
    return parseResumeFallback(resumeText);
  }
}

/**
 * Fallback resume parsing using regex patterns
 * This is used when OpenAI API is not available or fails
 */
function parseResumeFallback(resumeText: string): ParsedResume {
  const result: ParsedResume = {};

  console.log('Using fallback regex parsing...');

  // Extract email
  const emailMatch = resumeText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  if (emailMatch) {
    result.email = emailMatch[0];
    console.log('Extracted email:', result.email);
  }

  // Extract phone (various formats)
  const phoneMatch = resumeText.match(/(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/);
  if (phoneMatch) {
    result.phone = phoneMatch[0];
    console.log('Extracted phone:', result.phone);
  }

  // Try to extract name (usually at the top, before email/phone)
  const lines = resumeText.split('\n').filter(line => line.trim().length > 0);
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    
    // Skip lines that look like headers, emails, phone numbers
    if (line.includes('@') || /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(line) || 
        line.toLowerCase().includes('resume') || line.toLowerCase().includes('curriculum')) {
      continue;
    }
    
    // Look for lines that might be a name (2-4 capitalized words, no special chars)
    const namePattern = /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})$/;
    const nameMatch = line.match(namePattern);
    
    if (nameMatch && nameMatch[0].length > 3 && nameMatch[0].length < 50) {
      const nameParts = nameMatch[0].split(/\s+/);
      if (nameParts.length >= 2) {
        result.firstName = nameParts[0];
        result.lastName = nameParts.slice(1).join(' ');
        console.log('Extracted name:', result.firstName, result.lastName);
        break;
      }
    }
    
    // Fallback: If first few lines don't match, use first non-email/phone line
    if (i === 0 && !result.firstName) {
      const nameParts = line.split(/\s+/);
      if (nameParts.length >= 2 && nameParts[0].length > 1 && nameParts[0].length < 20) {
        result.firstName = nameParts[0];
        result.lastName = nameParts.slice(1).join(' ');
        console.log('Extracted name from first line:', result.firstName, result.lastName);
      }
    }
  }

  // Try to extract name from email if we didn't get it yet
  if (!result.firstName && !result.lastName && result.email) {
    const emailName = result.email.split('@')[0];
    const nameParts = emailName.split(/[._-]/);
    if (nameParts.length >= 2) {
      result.firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
      result.lastName = nameParts[nameParts.length - 1].charAt(0).toUpperCase() + nameParts[nameParts.length - 1].slice(1);
      console.log('Extracted name from email:', result.firstName, result.lastName);
    }
  }

  // Extract skills (look for "Skills:" section)
  const skillsMatch = resumeText.match(/skills?:?\s*\n?([^\n]+(?:\n[^\n]+)*)/i);
  if (skillsMatch) {
    const skillsText = skillsMatch[1];
    result.skills = skillsText
      .split(/[,;•\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.length < 50) // Filter out too long items
      .slice(0, 10); // Limit to 10 skills
    if (result.skills.length > 0) {
      console.log('Extracted skills:', result.skills.length);
    }
  }

  console.log('Fallback parsing result:', result);
  return result;
}

/**
 * Main function to parse resume file
 */
export async function parseResumeFile(file: File): Promise<ParsedResume> {
  try {
    console.log('Starting resume parsing for file:', file.name, file.type, `Size: ${file.size} bytes`);
    
    // Extract text from resume file
    const resumeText = await extractTextFromResume(file);
    
    console.log('Extracted text length:', resumeText.length);
    console.log('Extracted text preview (first 500 chars):', resumeText.substring(0, 500));
    
    if (!resumeText || resumeText.trim().length === 0) {
      throw new Error('Could not extract text from resume file. The file may be corrupted or in an unsupported format.');
    }

    if (resumeText.trim().length < 50) {
      console.warn('Extracted text is very short, might be an issue with text extraction');
    }

    // Parse with AI
    const parsed = await parseResumeWithAI(resumeText);
    
    console.log('Final parsed result:', parsed);
    return parsed;
  } catch (error: any) {
    console.error('Resume parsing error:', error);
    console.error('Error stack:', error.stack);
    throw new Error(error.message || 'Failed to parse resume file');
  }
}
