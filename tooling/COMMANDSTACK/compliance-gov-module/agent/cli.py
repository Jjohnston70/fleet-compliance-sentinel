"""
Command-line interface for the Compliance RAG Agent.

Provides an interactive terminal interface for testing and using the compliance
agent directly from the command line.
"""

import logging
import sys
from typing import Optional

from .agent import ComplianceRAGAgent, get_agent
import config

logger = logging.getLogger(__name__)


def setup_logging():
    """Configure logging for CLI."""
    logging.basicConfig(
        level=getattr(logging, config.LOG_LEVEL),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
        ],
    )


def print_header():
    """Print welcome header."""
    print("\n" + "=" * 80)
    print("COMPLIANCE GOVERNMENT MODULE - Interactive CLI")
    print("=" * 80)
    print(f"\nProvider: {config.LLM_PROVIDER.upper()}")
    print(f"Content Directory: {config.CONTENT_DIR}")
    print("\nCommands:")
    print("  'help'     - Show this help message")
    print("  'status'   - Show agent status")
    print("  'history'  - Show conversation history")
    print("  'clear'    - Clear conversation history")
    print("  'exit'     - Exit the CLI")
    print("\nOr ask any compliance question. Start with '?' for multi-line input.\n")
    print("=" * 80 + "\n")


def print_footer():
    """Print goodbye footer."""
    print("\n" + "=" * 80)
    print("Thank you for using the Compliance Government Module!")
    print("=" * 80 + "\n")


def format_response(result: dict) -> str:
    """
    Format RAG response for terminal display.

    Args:
        result: Query result from agent

    Returns:
        Formatted string for display
    """
    lines = []

    # Answer
    lines.append("\n" + "-" * 80)
    lines.append("ANSWER:")
    lines.append("-" * 80)
    lines.append(result["answer"])

    # Sources
    if result.get("sources"):
        lines.append("\n" + "-" * 80)
        lines.append(f"SOURCES ({len(result['sources'])} references):")
        lines.append("-" * 80)

        for i, source in enumerate(result["sources"], 1):
            lines.append(f"\n[{i}] {source.get('source', 'Unknown')}")
            preview = source.get("content_preview", "")
            if preview:
                lines.append(f"    Preview: {preview}...")

    # Context info
    lines.append("\n" + "-" * 80)
    lines.append(f"Context: Used {result.get('context_chunks_used', 0)} document chunks")
    if "conversation_turns" in result:
        lines.append(f"Conversation: Turn {result['conversation_turns']}")
    lines.append("-" * 80 + "\n")

    return "\n".join(lines)


def get_multiline_input() -> str:
    """
    Get multiline input from user (started with '?').

    Returns:
        User's multiline input
    """
    print("(Enter text. Type '.' on a new line to finish)")
    lines = []

    while True:
        line = input()
        if line == ".":
            break
        lines.append(line)

    return "\n".join(lines)


def show_status(agent: ComplianceRAGAgent) -> None:
    """
    Display agent status information.

    Args:
        agent: ComplianceRAGAgent instance
    """
    status = agent.get_status()

    print("\n" + "=" * 80)
    print("AGENT STATUS")
    print("=" * 80)
    print(f"Status:              {status['status'].upper()}")
    print(f"LLM Provider:        {status['llm_provider']}")
    print(f"Embedding Provider:  {status['embedding_provider']}")
    print(f"Vector Store:        {'Loaded' if status['vector_store_loaded'] else 'Not Loaded'}")
    print(f"Conversation Turns:  {status['conversation_turns']}")
    print("=" * 80 + "\n")


def show_history(agent: ComplianceRAGAgent) -> None:
    """
    Display conversation history.

    Args:
        agent: ComplianceRAGAgent instance
    """
    history = agent.get_conversation_history()

    if not history:
        print("\nNo conversation history yet.\n")
        return

    print("\n" + "=" * 80)
    print("CONVERSATION HISTORY")
    print("=" * 80)

    for i, msg in enumerate(history, 1):
        role = msg.get("role", "unknown").upper()
        content = msg.get("content", "")
        content_preview = content[:100] + "..." if len(content) > 100 else content

        print(f"\n[{i}] {role}")
        print(f"    {content_preview}")

    print("\n" + "=" * 80 + "\n")


def show_help() -> None:
    """Display help information."""
    print("""
================================================================================
COMPLIANCE GOVERNMENT MODULE - CLI Help
================================================================================

COMMANDS:
  help                 - Show this help message
  status               - Show agent status information
  history              - Show conversation history
  clear                - Clear conversation history and start fresh
  exit                 - Exit the CLI

ASKING QUESTIONS:
  Just type your compliance question and press Enter.

  Examples:
    - "What are the NIST CSF controls?"
    - "How do I implement access controls for PHI data?"
    - "What's required for FedRAMP certification?"
    - "Tell me about SOC 2 compliance."

MULTILINE INPUT:
  Start with "?" to enter multiline input mode:
    ? <Enter>
    Your multiline question...
    can span multiple lines...
    . <Enter to finish>

FEATURES:
  - Multi-turn conversations with context history
  - Source citations from compliance documents
  - Referenced template recommendations
  - Small business compliance considerations

================================================================================
""")


def main(provider: Optional[str] = None) -> int:
    """
    Run the interactive CLI.

    Args:
        provider: Optional LLM provider override

    Returns:
        Exit code (0 for success, 1 for error)
    """
    setup_logging()

    try:
        print_header()

        # Initialize agent
        logger.info("Initializing compliance RAG agent...")
        print("Initializing compliance RAG agent...")

        agent = get_agent()
        print("Agent initialized successfully!\n")

        # Main loop
        while True:
            try:
                # Get user input
                user_input = input("You: ").strip()

                if not user_input:
                    continue

                # Handle commands
                if user_input.lower() == "help":
                    show_help()
                    continue

                elif user_input.lower() == "status":
                    show_status(agent)
                    continue

                elif user_input.lower() == "history":
                    show_history(agent)
                    continue

                elif user_input.lower() == "clear":
                    agent.clear_conversation_history()
                    print("\nConversation history cleared.\n")
                    continue

                elif user_input.lower() == "exit":
                    break

                elif user_input.startswith("?"):
                    user_input = get_multiline_input()

                # Process query
                print("\nProcessing query...")
                result = agent.chat(user_input)
                print(format_response(result))

            except KeyboardInterrupt:
                print("\n\nInterrupted by user.")
                break
            except Exception as e:
                logger.error(f"Error processing query: {e}")
                print(f"\nError: {str(e)}")
                print("Please try again.\n")

        print_footer()
        return 0

    except Exception as e:
        logger.error(f"Fatal error: {e}")
        print(f"\nFatal error: {e}")
        print_footer()
        return 1


if __name__ == "__main__":
    sys.exit(main())
