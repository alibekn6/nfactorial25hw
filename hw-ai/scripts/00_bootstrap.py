#!/usr/bin/env python3
"""
00 — Study Assistant Bootstrap Script

Creates a specialized OpenAI assistant for study Q&A with file_search capabilities.
Uploads course PDFs and configures the assistant for document-based question answering.

Usage: python scripts/00_study_assistant_bootstrap.py

Goal: Build an assistant that answers study questions by retrieving passages from uploaded PDFs.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
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
    """Load existing assistant ID from .study_assistant file if it exists."""
    assistant_file = Path(".study_assistant")
    if assistant_file.exists():
        return assistant_file.read_text().strip()
    return None

def save_assistant_id(assistant_id):
    """Save assistant ID to .study_assistant file for reuse."""
    assistant_file = Path(".study_assistant")
    assistant_file.write_text(assistant_id)
    print(f"💾 Assistant ID saved to {assistant_file}")

def verify_assistant_exists(client, assistant_id):
    """Verify if an assistant exists on OpenAI servers."""
    try:
        client.beta.assistants.retrieve(assistant_id)
        return True
    except Exception:
        return False

def find_pdf_files():
    """Find PDF files in the data directory."""
    data_dir = Path("data")
    if not data_dir.exists():
        print("📁 Creating data/ directory...")
        data_dir.mkdir()
        print("📚 Please add your course PDF files to the data/ directory and run this script again.")
        return []
    
    pdf_files = list(data_dir.glob("*.pdf"))
    if not pdf_files:
        print("📚 No PDF files found in data/ directory.")
        print("   Please add your course PDF files to data/ and run this script again.")
        return []
    
    print(f"📚 Found {len(pdf_files)} PDF files:")
    for pdf in pdf_files:
        print(f"   - {pdf.name}")
    
    return pdf_files

def upload_pdfs(client, pdf_files):
    """Upload PDF files to OpenAI for file_search."""
    print(f"\n📤 Uploading {len(pdf_files)} PDF files...")
    
    file_ids = []
    for pdf_file in pdf_files:
        print(f"   Uploading {pdf_file.name}...")
        try:
            with open(pdf_file, "rb") as f:
                file = client.files.create(
                    file=f,
                    purpose="assistants"  # Updated purpose for assistants API
                )
            file_ids.append(file.id)
            print(f"   ✅ {pdf_file.name} → {file.id}")
        except Exception as e:
            print(f"   ❌ Failed to upload {pdf_file.name}: {e}")
    
    return file_ids

def create_vector_store(client, file_ids):
    """Create a vector store and add files to it."""
    print(f"\n🧠 Creating vector store with {len(file_ids)} files...")
    
    try:
        vector_store = client.beta.vector_stores.create(
            name="Study Materials",
            file_ids=file_ids
        )
        print(f"✅ Vector store created: {vector_store.id}")
        return vector_store.id
    except Exception as e:
        print(f"❌ Error creating vector store: {e}")
        return None

def create_or_update_study_assistant(client, vector_store_id=None):
    """Create a new study assistant or update existing one."""
    existing_id = load_assistant_id()
    
    assistant_config = {
        "name": "Study Q&A Assistant",
        "model": "gpt-4o-mini",
        "instructions": """You are a helpful tutor and study assistant.

Your primary role is to help students learn by:
- Answering questions using the knowledge in the attached course materials
- Providing clear, educational explanations
- Citing specific sources and page numbers when possible
- Breaking down complex concepts into understandable parts
- Suggesting related topics for further study

When answering questions:
1. Search through the uploaded course materials first
2. Provide accurate information based on the documents
3. Include citations like "According to [Document Name], page X..."
4. If information isn't in the materials, clearly state that
5. Encourage active learning with follow-up questions

Always be encouraging and supportive of the learning process.""",
        "tools": [{"type": "file_search"}],
        "temperature": 0.3,  # Lower temperature for more consistent, factual responses
        "top_p": 1.0
    }
    
    # Add vector store if provided
    if vector_store_id:
        assistant_config["tool_resources"] = {
            "file_search": {
                "vector_store_ids": [vector_store_id]
            }
        }
    
    try:
        if existing_id and verify_assistant_exists(client, existing_id):
            print(f"🔄 Updating existing study assistant: {existing_id}")
            assistant = client.beta.assistants.update(
                assistant_id=existing_id,
                **assistant_config
            )
            print("✅ Study assistant updated successfully!")
        else:
            if existing_id:
                print("⚠️ Existing assistant not found, creating new one...")
                # Remove the invalid ID file
                assistant_file = Path(".study_assistant")
                if assistant_file.exists():
                    assistant_file.unlink()
            else:
                print("🆕 Creating new study assistant...")
            
            assistant = client.beta.assistants.create(**assistant_config)
            save_assistant_id(assistant.id)
            print("✅ Study assistant created successfully!")
        
        print(f"📋 Assistant Details:")
        print(f"   ID: {assistant.id}")
        print(f"   Name: {assistant.name}")
        print(f"   Model: {assistant.model}")
        print(f"   Tools: {[tool.type for tool in assistant.tools]}")
        if vector_store_id:
            print(f"   Vector Store: {vector_store_id}")
        
        return assistant
        
    except Exception as e:
        print(f"❌ Error creating/updating assistant: {e}")
        sys.exit(1)

def save_file_info(file_ids):
    """Save uploaded file IDs for reference."""
    if file_ids:
        file_info_path = Path(".study_files")
        file_info_path.write_text("\n".join(file_ids))
        print(f"💾 File IDs saved to {file_info_path}")

def main():
    """Main function to bootstrap the study assistant."""
    print("🚀 OpenAI Study Assistant - Bootstrap")
    print("=" * 50)
    

    client = get_client()
    print("✅ OpenAI client initialized")
    
    # Find PDF files
    pdf_files = find_pdf_files()
    
    vector_store_id = None
    if pdf_files:
        # Upload PDFs
        file_ids = upload_pdfs(client, pdf_files)
        
        if file_ids:
            # Create vector store
            vector_store_id = create_vector_store(client, file_ids)
            
            # Save file info
            save_file_info(file_ids)
        else:
            print("⚠️ No files were uploaded successfully.")
    
    # Create or update assistant
    assistant = create_or_update_study_assistant(client, vector_store_id)
    
    print("\n🎯 Next Steps:")
    if not pdf_files:
        print("   1. Add PDF files to the data/ directory")
        print("   2. Run this script again to upload them")
        print("   3. Then run: python scripts/01_study_qa.py")
    else:
        print("   1. Run: python scripts/01_study_qa.py")
        print("   2. Ask questions about your course materials!")
    
    print("\n💡 Tips:")
    print("   - Add more PDFs to data/ directory and re-run to update")
    print("   - Use 'python scripts/99_cleanup.py' to clean up resources")
    
    if pdf_files:
        print(f"\n📚 Ready to answer questions about:")
        for pdf in pdf_files:
            print(f"   - {pdf.name}")

if __name__ == "__main__":
    main()