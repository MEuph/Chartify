from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .flowchart_to_graph import parse_xml_to_graph
from dotenv import load_dotenv
import openai, os
from tempfile import NamedTemporaryFile

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

SYSTEM_PROMPT = "Only output the corrected and complete source code. No explanation, no comments."

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "Content-Type", "Authorization", "Access-Control-Allow-Origin"],
)
 

@app.get("/api/py/sanity_check")
def sanity_check():
    return {"sanity": "Your sanity has been validated."}

@app.post("/api/py/generate")
async def generate_code(file: UploadFile = File(...)):
    try:
        with NamedTemporaryFile(delete=False, suffix=".drawio") as temp_file:
            temp_path = temp_file.name
            content = await file.read()
            temp_file.write(content)

        # Parsing and making Prompt
        graph = parse_xml_to_graph(temp_path)
        prompt = build_prompt_from_graph(graph)

        # Send to LLM (gpt-3.5-turbo chosen from limited accuracy testing)
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )
        result = response["choices"][0]["message"]["content"].strip()
        return {"code": result, "prompt_used": prompt}
    except Exception as e:
        print("[BACKEND ERROR]", str(e))
        return JSONResponse(content={"code": f"error:{e}\ncontent:{await file.read()}", "error": str(e)})


def build_prompt_from_graph(graph):
    visited = set()
    lines = []

    def walk(nid, indent=0):
        if nid in visited:
            return
        visited.add(nid)
        node = graph.nodes[nid]
        prefix = ' ' * indent

        if node.type == 'start':
            lines.append(f"{prefix}Start the program.")
        elif node.type == 'end':
            lines.append(f"{prefix}End the program.")
        elif node.type == 'process':
            lines.append(f"{prefix}Do: {node.text}")
        elif node.type == 'if':
            lines.append(f"{prefix}If {node.text}:")
            for t in graph.get_successors(nid, 'true'):
                lines.append(f"{prefix}  [True] →")
                walk(t.id, indent + 4)
            for f in graph.get_successors(nid, 'false'):
                lines.append(f"{prefix}  [False] →")
                walk(f.id, indent + 4)
            return

        for edge in graph.adj.get(nid, []):
            walk(edge.dst, indent)

    walk(graph.start_node_id)
    return "\n".join(lines)
