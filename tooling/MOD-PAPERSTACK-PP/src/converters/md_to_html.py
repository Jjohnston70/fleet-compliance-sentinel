"""
Markdown to HTML Converter - GitHub README Style
=================================================
TRUE NORTH DATA STRATEGIES

HOW TO RUN:
  python md_to_html.py README.md                    ← converts to README.html
  python md_to_html.py USER_MANUAL.md               ← converts to USER_MANUAL.html
  python md_to_html.py myfile.md output.html         ← custom output filename
  python md_to_html.py myfile.md --dark              ← dark mode (GitHub dark theme)
  python md_to_html.py myfile.md --open              ← auto-opens in browser after converting

WHAT THIS DOES:
  Takes any .md (Markdown) file and converts it to a standalone .html file
  that looks like a GitHub README page. The HTML file includes all CSS styling
  inline — no internet connection needed, no external files, just double-click
  and it opens in any browser looking clean and professional.

REQUIRES:
  pip install markdown pymdown-extensions

FEATURES:
  - GitHub-style light theme (default) or dark theme (--dark flag)
  - Syntax-highlighted code blocks
  - Styled tables, blockquotes, lists, headings
  - Responsive (looks good on mobile)
  - Print-friendly
  - Table of contents links work (anchor links)
  - All styling is self-contained in the single HTML file
"""

import sys                                             # sys.argv gives us command line arguments (the filename you pass in)
import os                                              # os.path for file path manipulation (getting filename without extension, checking if file exists)
import markdown                                        # The markdown library - converts Markdown text to HTML tags
import webbrowser                                      # Opens URLs/files in the default browser (used with --open flag)


def get_github_css(dark=False):
    """
    Returns a complete CSS stylesheet that mimics GitHub's README rendering.
    
    dark=False → GitHub light theme (white background, dark text)
    dark=True  → GitHub dark theme (dark background, light text)
    
    This is a self-contained CSS string — no external stylesheets needed.
    The HTML file works completely offline.
    """

    if dark:
        # ============================================
        # DARK THEME COLORS
        # Matches GitHub's dark mode appearance
        # ============================================
        colors = """
            --bg-primary: #0d1117;           /* Page background - very dark blue-gray */
            --bg-secondary: #161b22;         /* Card/container background - slightly lighter */
            --bg-tertiary: #21262d;          /* Code blocks, table headers - even lighter */
            --border-color: #30363d;         /* Borders on tables, blockquotes, hr lines */
            --text-primary: #e6edf3;         /* Main body text - off-white */
            --text-secondary: #8b949e;       /* Muted text - gray */
            --text-link: #58a6ff;            /* Link color - bright blue */
            --text-heading: #e6edf3;         /* Heading text - same as primary */
            --code-bg: #161b22;              /* Inline code background */
            --code-text: #e6edf3;            /* Inline code text color */
            --blockquote-border: #3b4754;    /* Left border on blockquotes */
            --blockquote-text: #8b949e;      /* Blockquote text color */
            --table-row-alt: #161b22;        /* Alternating table row background */
            --highlight: #1f6feb33;          /* Selected/highlighted text background (33 = 20% opacity) */
        """
    else:
        # ============================================
        # LIGHT THEME COLORS (DEFAULT)
        # Matches GitHub's standard light mode
        # ============================================
        colors = """
            --bg-primary: #ffffff;           /* Page background - white */
            --bg-secondary: #f6f8fa;         /* Card/container background - very light gray */
            --bg-tertiary: #f0f2f5;          /* Code blocks, table headers */
            --border-color: #d1d9e0;         /* Borders */
            --text-primary: #1f2328;         /* Main body text - near-black */
            --text-secondary: #656d76;       /* Muted text */
            --text-link: #0969da;            /* Link color - GitHub blue */
            --text-heading: #1f2328;         /* Heading text */
            --code-bg: #eff1f3;              /* Inline code background - light gray */
            --code-text: #1f2328;            /* Inline code text */
            --blockquote-border: #d1d9e0;    /* Blockquote left border */
            --blockquote-text: #656d76;      /* Blockquote text */
            --table-row-alt: #f6f8fa;        /* Alternating table row */
            --highlight: #0969da1a;          /* Highlight background (1a = 10% opacity) */
        """

    # ============================================
    # FULL CSS STYLESHEET
    # Every rule is annotated with what it styles
    # ============================================
    return f"""
    <style>
        /* ============================================
         * CSS VARIABLES
         * All colors defined here via the dark/light toggle above
         * var(--name) references these throughout the stylesheet
         * ============================================ */
        :root {{
            {colors}
        }}

        /* ============================================
         * RESET & BASE
         * Remove default browser styling for consistency
         * ============================================ */
        * {{
            margin: 0;                                  /* Remove all default margins */
            padding: 0;                                 /* Remove all default padding */
            box-sizing: border-box;                     /* Width includes padding + border */
        }}

        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans',  /* GitHub's exact font stack */
                         Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                         'Segoe UI Emoji';
            font-size: 16px;                            /* Base font size - all rem units are relative to this */
            line-height: 1.5;                           /* Default line spacing */
            color: var(--text-primary);                 /* Default text color */
            background-color: var(--bg-primary);        /* Page background */
            -webkit-font-smoothing: antialiased;        /* Smoother font rendering on Mac/Chrome */
        }}

        /* ============================================
         * MAIN CONTAINER
         * The white/dark card that holds all content
         * Mimics the README container on GitHub
         * ============================================ */
        .markdown-body {{
            max-width: 980px;                           /* GitHub's README max width */
            margin: 32px auto;                          /* 32px top/bottom, auto centers horizontally */
            padding: 48px;                              /* Internal padding on all sides */
            background: var(--bg-primary);              /* Container background */
            border: 1px solid var(--border-color);      /* Subtle border around the container */
            border-radius: 6px;                         /* Rounded corners */
        }}

        /* ============================================
         * HEADINGS (h1 through h6)
         * Each level gets progressively smaller
         * h1 and h2 get a bottom border (like GitHub)
         * ============================================ */
        .markdown-body h1,
        .markdown-body h2,
        .markdown-body h3,
        .markdown-body h4,
        .markdown-body h5,
        .markdown-body h6 {{
            margin-top: 24px;                           /* Space above heading */
            margin-bottom: 16px;                        /* Space below heading */
            font-weight: 600;                           /* Semi-bold (600 = between normal 400 and bold 700) */
            line-height: 1.25;                          /* Tighter line height for headings */
            color: var(--text-heading);
        }}

        .markdown-body h1 {{
            font-size: 2em;                             /* 2x base size = 32px */
            padding-bottom: 0.3em;                      /* Space between text and border */
            border-bottom: 1px solid var(--border-color);  /* Horizontal line under h1 (GitHub style) */
        }}

        .markdown-body h2 {{
            font-size: 1.5em;                           /* 1.5x = 24px */
            padding-bottom: 0.3em;
            border-bottom: 1px solid var(--border-color);  /* Line under h2 too */
        }}

        .markdown-body h3 {{ font-size: 1.25em; }}     /* 20px */
        .markdown-body h4 {{ font-size: 1em; }}         /* 16px (same as body but bold) */
        .markdown-body h5 {{ font-size: 0.875em; }}     /* 14px */
        .markdown-body h6 {{ font-size: 0.85em; color: var(--text-secondary); }}  /* 13.6px, muted color */

        /* ============================================
         * PARAGRAPHS & BASIC TEXT
         * ============================================ */
        .markdown-body p {{
            margin-bottom: 16px;                        /* Space between paragraphs */
        }}

        .markdown-body a {{
            color: var(--text-link);                    /* Link color */
            text-decoration: none;                      /* No underline by default */
        }}

        .markdown-body a:hover {{
            text-decoration: underline;                 /* Underline on hover */
        }}

        .markdown-body strong {{
            font-weight: 600;                           /* Bold text */
        }}

        .markdown-body em {{
            font-style: italic;
        }}

        /* ============================================
         * HORIZONTAL RULES (--- in markdown)
         * ============================================ */
        .markdown-body hr {{
            height: 0.25em;                             /* Slightly thick line */
            padding: 0;
            margin: 24px 0;                             /* 24px space above and below */
            background-color: var(--border-color);      /* Gray line color */
            border: 0;                                  /* Remove default border (we use background instead) */
            border-radius: 2px;                         /* Slight rounding */
        }}

        /* ============================================
         * LISTS (bullets and numbered)
         * ============================================ */
        .markdown-body ul,
        .markdown-body ol {{
            margin-bottom: 16px;
            padding-left: 2em;                          /* Indent the list from the left edge */
        }}

        .markdown-body li {{
            margin-bottom: 4px;                         /* Small gap between list items */
        }}

        .markdown-body li + li {{
            margin-top: 0.25em;                         /* Additional gap between consecutive items */
        }}

        /* Nested lists (list inside a list) */
        .markdown-body li > ul,
        .markdown-body li > ol {{
            margin-top: 4px;
            margin-bottom: 0;                           /* No extra bottom margin for nested lists */
        }}

        /* ============================================
         * BLOCKQUOTES (> in markdown)
         * ============================================ */
        .markdown-body blockquote {{
            margin: 0 0 16px 0;
            padding: 0 1em;                             /* 1em padding on left and right */
            color: var(--blockquote-text);              /* Muted text color */
            border-left: 0.25em solid var(--blockquote-border);  /* Thick left border (GitHub style) */
        }}

        .markdown-body blockquote > :first-child {{
            margin-top: 0;                              /* Remove top margin from first element inside blockquote */
        }}

        .markdown-body blockquote > :last-child {{
            margin-bottom: 0;                           /* Remove bottom margin from last element */
        }}

        /* ============================================
         * CODE - Inline and Block
         * ============================================ */

        /* Inline code: `code` in markdown */
        .markdown-body code {{
            padding: 0.2em 0.4em;                       /* Small padding around inline code */
            margin: 0;
            font-size: 85%;                             /* Slightly smaller than body text */
            font-family: 'SFMono-Regular', Consolas,    /* Monospace font stack */
                         'Liberation Mono', Menlo, monospace;
            background-color: var(--code-bg);           /* Light gray background */
            color: var(--code-text);
            border-radius: 6px;                         /* Rounded corners */
            white-space: break-spaces;                  /* Allow wrapping within inline code */
            word-break: break-word;                     /* Break long words to prevent overflow */
        }}

        /* Code blocks: ```code``` in markdown */
        .markdown-body pre {{
            margin-bottom: 16px;
            padding: 16px;                              /* Internal padding */
            overflow: auto;                             /* Horizontal scrollbar if code is too wide */
            font-size: 85%;
            line-height: 1.45;                          /* Slightly tighter than body text */
            background-color: var(--bg-secondary);      /* Slightly different background than page */
            border-radius: 6px;                         /* Rounded corners */
            border: 1px solid var(--border-color);      /* Subtle border */
            word-wrap: normal;                          /* Don't wrap code lines (use scrollbar instead) */
        }}

        /* Code inside code blocks should NOT have the inline code styling */
        .markdown-body pre code {{
            padding: 0;                                 /* Remove inline code padding */
            margin: 0;
            font-size: 100%;                            /* Full size (the pre already sets 85%) */
            background-color: transparent;              /* No background (pre handles it) */
            border-radius: 0;
            white-space: pre;                           /* Preserve whitespace and line breaks exactly */
            word-break: normal;
        }}

        /* ============================================
         * TABLES
         * ============================================ */
        .markdown-body table {{
            border-collapse: collapse;                  /* Remove gaps between cell borders */
            border-spacing: 0;                          /* No space between cells */
            margin-bottom: 16px;
            width: 100%;                                /* Full width of container */
            overflow: auto;                             /* Scrollbar if table is too wide */
            display: block;                             /* Required for overflow to work on tables */
        }}

        .markdown-body th,
        .markdown-body td {{
            padding: 6px 13px;                          /* Cell padding: 6px top/bottom, 13px left/right */
            border: 1px solid var(--border-color);      /* Cell borders */
            text-align: left;                           /* Left-align by default */
        }}

        .markdown-body th {{
            font-weight: 600;                           /* Bold header text */
            background-color: var(--bg-secondary);      /* Slightly shaded header row */
        }}

        /* Alternating row colors (zebra striping) */
        .markdown-body tr:nth-child(2n) {{
            background-color: var(--table-row-alt);     /* Every even row gets a subtle background */
        }}

        /* ============================================
         * IMAGES
         * ============================================ */
        .markdown-body img {{
            max-width: 100%;                            /* Never wider than container */
            height: auto;                               /* Maintain aspect ratio */
            border-radius: 4px;                         /* Slight rounding */
        }}

        /* ============================================
         * SUB/SUP (small text tags often used in markdown)
         * ============================================ */
        .markdown-body sub {{
            font-size: 0.75em;                          /* 75% of parent size */
            color: var(--text-secondary);               /* Muted color */
        }}

        /* ============================================
         * TASK LISTS (- [ ] and - [x] in markdown)
         * ============================================ */
        .markdown-body .task-list-item {{
            list-style-type: none;                      /* Remove bullet since checkbox replaces it */
        }}

        .markdown-body .task-list-item input {{
            margin-right: 0.5em;                        /* Space between checkbox and text */
        }}

        /* ============================================
         * PRINT STYLES
         * Applied when printing (Ctrl+P)
         * ============================================ */
        @media print {{
            body {{
                background: white;                      /* White background for print */
            }}
            .markdown-body {{
                border: none;                           /* Remove border for print */
                margin: 0;                              /* No margins */
                padding: 20px;                          /* Minimal padding */
                max-width: 100%;                        /* Full page width */
            }}
        }}

        /* ============================================
         * RESPONSIVE (Mobile)
         * ============================================ */
        @media (max-width: 767px) {{
            .markdown-body {{
                padding: 16px;                          /* Less padding on mobile */
                margin: 0;                              /* No margin - fill the screen */
                border: none;                           /* No border on mobile */
                border-radius: 0;                       /* No rounded corners */
            }}
        }}
    </style>
    """


def convert_md_to_html(input_path, output_path=None, dark=False, auto_open=False):
    """
    Converts a Markdown file to a self-contained GitHub-styled HTML file.
    
    Parameters:
        input_path  = Path to the .md file (e.g., "README.md")
        output_path = Path for the output .html file (optional, defaults to same name with .html)
        dark        = True for dark theme, False for light theme
        auto_open   = True to auto-open the HTML file in the default browser
    """

    # --- Validate input file exists ---
    if not os.path.exists(input_path):                  # Check if the file is real
        print(f"Error: File not found: {input_path}")
        sys.exit(1)                                     # Exit with error code 1

    # --- Generate output filename if not provided ---
    if output_path is None:
        base_name = os.path.splitext(input_path)[0]     # Remove .md extension: "README.md" → "README"
        output_path = base_name + ".html"                # Add .html: "README" → "README.html"

    # --- Read the Markdown file ---
    with open(input_path, "r", encoding="utf-8") as f:  # Open in read mode with UTF-8 encoding (supports special characters)
        md_content = f.read()                            # Read entire file into a string

    # --- Convert Markdown to HTML ---
    # The markdown library parses the .md syntax and outputs HTML tags
    # Extensions add extra features beyond basic Markdown:
    html_content = markdown.markdown(
        md_content,
        extensions=[
            "tables",                                   # Enables | table | syntax |
            "fenced_code",                              # Enables ```code block``` syntax
            "codehilite",                               # Syntax highlighting for code blocks
            "toc",                                      # Table of Contents - makes heading anchor links work
            "nl2br",                                    # Converts single newlines to <br> tags (more forgiving)
            "sane_lists",                               # Better list handling (prevents weird nesting issues)
            "smarty",                                   # Converts "quotes" to smart quotes and -- to em dashes
            "md_in_html",                               # Allows Markdown inside HTML tags (like <sub>)
        ],
        extension_configs={
            "codehilite": {
                "css_class": "highlight",               # CSS class name for highlighted code blocks
                "guess_lang": False,                    # Don't guess the language - use explicit ```python etc.
            },
            "toc": {
                "permalink": False,                     # Don't add permalink anchors next to headings
            },
        }
    )

    # --- Get the page title from the filename ---
    title = os.path.splitext(os.path.basename(input_path))[0]  # "path/to/README.md" → "README"
    theme_label = "dark" if dark else "light"

    # --- Build the complete HTML document ---
    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    {get_github_css(dark)}
</head>
<body>
    <article class="markdown-body">
        {html_content}
    </article>
</body>
</html>"""

    # --- Write the HTML file ---
    with open(output_path, "w", encoding="utf-8") as f:  # Open in write mode
        f.write(full_html)                                # Write the complete HTML string

    file_size = os.path.getsize(output_path)              # Get file size in bytes
    file_size_kb = round(file_size / 1024, 1)             # Convert to KB

    print(f"Converted: {input_path} → {output_path}")
    print(f"Theme: {theme_label}")
    print(f"Size: {file_size_kb} KB")

    # --- Auto-open in browser if requested ---
    if auto_open:
        abs_path = os.path.abspath(output_path)           # Get full absolute path
        webbrowser.open(f"file://{abs_path}")              # Open in default browser
        print(f"Opened in browser")


def main():
    """
    Parses command line arguments and runs the converter.
    
    Usage:
        python md_to_html.py <input.md> [output.html] [--dark] [--open]
    
    Arguments:
        input.md    = Required. The Markdown file to convert.
        output.html = Optional. Custom output filename. Defaults to input name with .html.
        --dark      = Optional. Use GitHub dark theme instead of light.
        --open      = Optional. Auto-open the result in your default browser.
    """

    # --- Check for minimum arguments ---
    if len(sys.argv) < 2:                                 # sys.argv[0] is the script name, [1] would be the input file
        print("=" * 60)
        print("  Markdown to HTML Converter - GitHub README Style")
        print("  True North Data Strategies")
        print("=" * 60)
        print()
        print("  Usage:")
        print("    python md_to_html.py <input.md> [output.html] [--dark] [--open]")
        print()
        print("  Examples:")
        print("    python md_to_html.py README.md")
        print("    python md_to_html.py README.md --dark")
        print("    python md_to_html.py README.md --open")
        print("    python md_to_html.py README.md my_output.html --dark --open")
        print()
        print("  Flags:")
        print("    --dark    Use GitHub dark theme")
        print("    --open    Auto-open result in browser")
        print()
        sys.exit(0)                                       # Exit cleanly (not an error)

    # --- Parse arguments ---
    args = sys.argv[1:]                                   # Everything after the script name
    input_path = args[0]                                  # First argument is always the input file

    # Check for flags
    dark = "--dark" in args                               # True if --dark appears anywhere in arguments
    auto_open = "--open" in args                          # True if --open appears anywhere

    # Remove flags from args to find the optional output filename
    remaining = [a for a in args[1:] if not a.startswith("--")]  # Filter out flags, keep only positional args

    output_path = remaining[0] if remaining else None     # If there's a remaining arg, it's the output filename

    # --- Run the conversion ---
    convert_md_to_html(input_path, output_path, dark, auto_open)


# ============================================
# ENTRY POINT
# This runs when you execute: python md_to_html.py
# It does NOT run if this file is imported by another script
# ============================================
if __name__ == "__main__":
    main()
