try:
    from google import genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

from cortex.core.config import config
import logging

logger = logging.getLogger("cortex.models.llm")

class LLMEngine:
    def __init__(self):
        self.api_key = config.GOOGLE_API_KEY
        self.model_name = config.LLM_MODEL
        self.initialized = False
        self.client = None
        
        if self.api_key:
            if HAS_GENAI:
                try:
                    self.client = genai.Client(api_key=self.api_key)
                    self.initialized = True
                    key_hint = f"{self.api_key[:4]}...{self.api_key[-4:]}"
                    logger.info(f"Gemini LLM Engine initialized with model: {self.model_name} (Key: {key_hint})")
                except Exception as e:
                    logger.error(f"Failed to initialize Gemini: {e}")
            else:
                logger.warning("run `pip install google-genai` to enable LLM features. Module not found.")
        else:
            logger.warning("GOOGLE_API_KEY not found. LLM features will be disabled.")

    async def generate_response(self, prompt: str, context: str = "") -> str:
        if not self.initialized:
            if not HAS_GENAI:
                return "Error: LLM driver (google-genai) not installed."
            return "Error: LLM Engine not initialized. Please check your API key."
        
        full_prompt = f"Context: {context}\n\nQuestion: {prompt}" if context else prompt
        
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=full_prompt
            )
            return response.text
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            logger.error(f"Error during LLM generation: {error_details}")
            return f"Error: {str(e)}"

    async def summarize(self, text: str, max_words: int = 100) -> str:
        if not self.initialized:
            return "Error: LLM Engine not initialized."
        
        prompt = f"Summarize the following text in about {max_words} words:\n\n{text}"
        
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            return response.text
        except Exception as e:
            logger.error(f"Error during summarization: {e}")
            return f"Error: {str(e)}"

# Global Instance
llm_engine = LLMEngine()
