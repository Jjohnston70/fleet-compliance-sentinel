"""
Data processor for cleaning and tokenizing text documents.

Processes extracted text files and produces cleaned, tokenized output.
"""

import logging
import json
import re
import sys
from pathlib import Path
from typing import List
import time

import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from tqdm import tqdm

from config import Config


logger = logging.getLogger(__name__)

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')


class DataProcessor:
    """Processes text documents for cleaning and tokenization."""

    def __init__(self, input_dir: Path, output_dir: Path):
        """
        Initialize the data processor.

        Args:
            input_dir: Directory containing raw text files.
            output_dir: Directory to save processed data.
        """
        self.input_dir = Path(input_dir)
        self.output_dir = Path(output_dir)

        self.output_dir.mkdir(parents=True, exist_ok=True)

        self.stop_words = set(stopwords.words('english'))
        logger.info(
            f"Initialized DataProcessor: {self.input_dir} -> {self.output_dir}"
        )
    
    def clean_text(self, text: str) -> str:
        """
        Clean and normalize text.

        Args:
            text: Raw text to clean.

        Returns:
            Cleaned text.
        """
        # Convert to lowercase
        text = text.lower()

        # Remove special characters and digits
        text = re.sub(r'[^\w\s]', ' ', text)
        text = re.sub(r'\d+', ' ', text)

        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()

        return text

    def tokenize_text(self, text: str) -> List[List[str]]:
        """
        Tokenize text into sentences and words.

        Args:
            text: Text to tokenize.

        Returns:
            List of tokenized sentences (list of word lists).
        """
        # Tokenize into sentences
        sentences = sent_tokenize(text)

        # Tokenize each sentence into words and remove stopwords
        tokenized_sentences = []
        for sentence in sentences:
            words = word_tokenize(sentence)
            words = [word for word in words if word not in self.stop_words]
            tokenized_sentences.append(words)

        return tokenized_sentences

    def process_file(self, file_path: Path) -> bool:
        """
        Process a single text file.

        Args:
            file_path: Path to the file to process.

        Returns:
            True if successful, False otherwise.
        """
        try:
            file_path = Path(file_path)

            # Read the file content
            content = file_path.read_text(encoding='utf-8')

            # Clean the text
            cleaned_text = self.clean_text(content)

            # Tokenize the text
            tokenized_text = self.tokenize_text(cleaned_text)

            # Create output filename
            output_filename = file_path.stem + '_processed.json'
            output_path = self.output_dir / output_filename

            # Create output data structure
            output_data = {
                'original_file': str(file_path),
                'processed_date': time.strftime('%Y-%m-%d %H:%M:%S'),
                'sentences_count': len(tokenized_text),
                'words_count': sum(len(sentence) for sentence in tokenized_text),
                'tokenized_text': tokenized_text,
                'cleaned_text': cleaned_text
            }

            # Save processed data
            output_path.write_text(
                json.dumps(output_data, indent=2),
                encoding='utf-8'
            )

            logger.debug(f"Processed: {file_path}")
            return True

        except Exception as e:
            logger.error(f"Error processing file {file_path}: {e}")
            return False
    
    def process_all_files(self) -> None:
        """
        Process all text files in the input directory and its subdirectories.

        Logs processing statistics and handles errors gracefully.
        """
        processed_count = 0
        failed_count = 0

        # Find all text files
        text_files = list(self.input_dir.rglob('*.txt'))

        logger.info(f"Found {len(text_files)} text files to process")

        # Process each file
        for file_path in tqdm(text_files):
            if self.process_file(file_path):
                processed_count += 1
            else:
                failed_count += 1

        logger.info(
            f"Processing complete: {processed_count} files processed, "
            f"{failed_count} files failed"
        )


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    try:
        # Use config paths
        input_dir = Config.DATA_DIR / "extracted"
        output_dir = Config.DATA_DIR / "processed"

        # Initialize processor
        processor = DataProcessor(input_dir, output_dir)

        # Process all files
        processor.process_all_files()

    except Exception as e:
        logger.error(f"Data processing failed: {e}")
        sys.exit(1)