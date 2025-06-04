#!/usr/bin/env python3
"""
00 — Assistant Bootstrap Script

Creates or updates a reusable OpenAI assistant with file_search capabilities.
Stores the ASSISTANT_ID in a local .assistant file for reuse across labs.

Docs: https://platform.openai.com/docs/api-reference/assistants
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

def get_client():
    """Initialize OpenAI client with API key from environment."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ Error: OPENAI_API_KEY not found in environment variables.")
        print("   Please copy .env.example to .env and add your API key.")
        sys.exit(1)
    
    org_id = os.getenv("OPENAI_ORG")
    client_kwargs = {"api_key": api_key}
    if org_id:
        client_kwargs["organization"] = org_id
    
    return OpenAI(**client_kwargs)

def load_assistant_id():
    """Load existing assistant ID from .assistant file if it exists."""
    assistant_file = Path(".assistant")
    if assistant_file.exists():
        return assistant_file.read_text().strip()
    return None

def save_assistant_id(assistant_id):
    """Save assistant ID to .assistant file for reuse."""
    assistant_file = Path(".assistant")
    assistant_file.write_text(assistant_id)
    print(f"💾 Assistant ID saved to {assistant_file}")

def create_or_update_assistant(client):
    """Create a new assistant or update existing one."""
    existing_id = load_assistant_id()
    
    assistant_config = {
        "name": "Study Q&A Assistant",
        "model": "gpt-4o-mini",
        "instructions": """
            "You are a helpful tutor. "
            "Use the knowledge in the attached files to answer questions. "
            "Cite sources where possible."
        """,
        "tools": [{"type": "file_search"}],  # Enable built-in RAG
        "temperature": 0.5,
        "top_p": 1.0
    }
    
    try:
        if existing_id:
            print(f"🔄 Updating existing assistant: {existing_id}")
            assistant = client.beta.assistants.update(
                assistant_id=existing_id,
                **assistant_config
            )
            print("✅ Assistant updated successfully!")
        else:
            print("🆕 Creating new assistant...")
            assistant = client.beta.assistants.create(**assistant_config)
            save_assistant_id(assistant.id)
            print("✅ Assistant created successfully!")
        
        print(f"📋 Assistant Details:")
        print(f"   ID: {assistant.id}")
        print(f"   Name: {assistant.name}")
        print(f"   Model: {assistant.model}")
        print(f"   Tools: {[tool.type for tool in assistant.tools]}")
        
        return assistant
        
    except Exception as e:
        print(f"❌ Error creating/updating assistant: {e}")
        sys.exit(1)

def upload_pdf_files(client, assistant_id, pdf_directory="data"):
    """
    Upload PDF files and attach them to the assistant's vector store.
    
    Args:
        client: OpenAI client instance
        assistant_id: ID of the assistant to attach files to
        pdf_directory: Directory containing PDF files (default: "data")
    """
    pdf_dir = Path(pdf_directory)
    
    if not pdf_dir.exists():
        print(f"📁 Directory '{pdf_directory}' not found. Creating it...")
        pdf_dir.mkdir(parents=True, exist_ok=True)
        print(f"   Please add your PDF files to the '{pdf_directory}' directory and run again.")
        return
    
    # Find all PDF files in the directory
    pdf_files = list(pdf_dir.glob("*.pdf"))
    
    if not pdf_files:
        print(f"📄 No PDF files found in '{pdf_directory}' directory.")
        return
    
    print(f"📚 Found {len(pdf_files)} PDF file(s) to upload:")
    for pdf_file in pdf_files:
        print(f"   - {pdf_file.name}")
    
    # Upload files and collect file IDs
    file_ids = []
    
    for pdf_file in pdf_files:
        try:
            print(f"⬆️  Uploading {pdf_file.name}...")
            with open(pdf_file, "rb") as f:
                file_obj = client.files.create(
                    purpose="assistants",
                    file=f
                )
            file_ids.append(file_obj.id)
            print(f"   ✅ Uploaded successfully (ID: {file_obj.id})")
            
        except Exception as e:
            print(f"   ❌ Error uploading {pdf_file.name}: {e}")
    
    if not file_ids:
        print("❌ No files were uploaded successfully.")
        return
    
    # For older API versions, we need to update the assistant creation instead
    if file_ids:
        print(f"✅ Successfully uploaded {len(file_ids)} PDF file(s)!")
        print("📝 Note: Files uploaded. You'll need to reference them when creating threads.")
        print("   File IDs for reference:")
        for i, file_id in enumerate(file_ids, 1):
            print(f"   {i}. {file_id}")
    else:
        print("❌ No files were uploaded successfully.")

def main():
    """Main function to bootstrap the assistant."""
    print("🚀 OpenAI Practice Lab - Assistant Bootstrap")
    print("=" * 50)
    
    # Initialize client
    client = get_client()
    print("✅ OpenAI client initialized")
    
    # Create or update assistant
    assistant = create_or_update_assistant(client)

    #  Upload PDF files and attach to assistant
    print("\n📚 Setting up knowledge base...")

    upload_pdf_files(client, assistant.id)



    
    print("\n🎯 Next Steps:")
    print("   1. Run: python scripts/01_responses_api.py")
    print("   2. Or explore other lab modules in the scripts/ directory")
    print("\n💡 Tip: Use 'python scripts/99_cleanup.py' to clean up resources when done")

if __name__ == "__main__":
    main()