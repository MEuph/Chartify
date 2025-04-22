#!/usr/bin/env python3
"""
flowchart_to_graph.py

Convert a draw.io flowchart (.drawio XML) into a parsed graph and print its structure.

Symbol Guide:
- Rounded rectangle labeled "Start"   => start
- Rounded rectangle labeled "End"     => end
- Regular rectangle                   => process
- Diamond (rhombus shape)             => if (decision)
- Red edge (strokeColor: #B85450)     => false condition path
- Default/black edge                  => true condition path
"""
import xml.etree.ElementTree as ET
import html
import logging
from collections import defaultdict
from typing import Dict, List, Optional, Tuple, Set

# Verbose Logging Init
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)


class Node:
    def __init__(self, id: str, text: str, type: str, bounds: Optional[Tuple[float, float, float, float]]):
        self.id = id
        self.text = html.unescape(text) if text else ''
        self.type = type
        self.bounds = bounds

    def __repr__(self):
        return f"<Node {self.id} '{self.text}' ({self.type})>"


class Edge:
    def __init__(self, src: str, dst: str, condition: str = 'true'):
        self.src = src
        self.dst = dst
        self.condition = condition

    def __repr__(self):
        return f"<Edge {self.src} -> {self.dst} ({self.condition})>"


class Graph:
    def __init__(self):
        self.nodes: Dict[str, Node] = {}
        self.edges: List[Edge] = []
        self.adj = defaultdict(list)
        self.rev = defaultdict(list)
        self.start_node_id: Optional[str] = None
        self.end_nodes: List[str] = []

    def add_node(self, id: str, text: str, type: str, bounds=None) -> None:
        if id in self.nodes:
            logger.warning(f"Duplicate node ID {id} detected")
            return
        node = Node(id, text, type, bounds)
        self.nodes[id] = node
        if type == 'start':
            if self.start_node_id:
                raise ValueError(f"Multiple start nodes detected: {id} and {self.start_node_id}")
            self.start_node_id = id
            logger.info(f"Start node identified: {node}")
        elif type == 'end':
            self.end_nodes.append(id)
            logger.info(f"End node identified: {node}")

    def add_edge(self, src: str, dst: str, condition: str = 'true') -> None:
        if src not in self.nodes:
            logger.error(f"Edge source node {src} not found")
            return
        if dst not in self.nodes:
            logger.error(f"Edge target node {dst} not found")
            return
        edge = Edge(src, dst, condition)
        self.edges.append(edge)
        self.adj[src].append(edge)
        self.rev[dst].append(edge)
        logger.debug(f"Added edge: {edge}")

    def get_successors(self, node_id: str, condition: Optional[str] = None) -> List['Node']:
        """Get successor nodes with filtering."""
        return [
            self.nodes[e.dst]
            for e in self.adj.get(node_id, [])
            if condition is None or e.condition == condition
        ]

    def print_graph(self):
        print("\n--- Graph Structure ---")
        for node_id, node in self.nodes.items():
            print(f"{node_id}: {node.text} ({node.type})")
        print("\nEdges:")
        for edge in self.edges:
            print(f"{edge.src} -> {edge.dst} [condition: {edge.condition}]")
        print("------------------------\n")


def parse_style(style_str: str) -> Dict[str, str]:
    style = {}
    if not style_str:
        return style
    for part in style_str.split(';'):
        if '=' in part:
            key, val = part.split('=', 1)
            style[key.strip().lower()] = val.strip().lower()
    return style

def parse_xml_to_graph(xml_file: str) -> Graph:
    logger.info(f"Parsing XML file: {xml_file}")
    graph = Graph()
    try:
        tree = ET.parse(xml_file)
    except ET.ParseError as e:
        logger.error(f"Invalid XML format: {e}")
        raise
    except FileNotFoundError:
        logger.error(f"File not found: {xml_file}")
        raise

    root = tree.getroot()
    for cell in root.findall('.//mxCell'):
        if cell.get('vertex') == '1':
            vid = cell.get('id')
            if not vid:
                logger.warning("Vertex missing ID, skipping")
                continue
            text = (cell.get('value') or '').strip()
            style_str = cell.get('style', '').lower()
            style = parse_style(style_str)

            if 'rhombus' in style_str:
                ntype = 'if'
            elif style.get('rounded') == '1':
                if text.lower() == 'start':
                    ntype = 'start'
                elif text.lower() == 'end':
                    ntype = 'end'
                else:
                    ntype = 'process'
            else:
                ntype = 'process'

            geom = cell.find('mxGeometry')
            bounds = None
            if geom is not None:
                try:
                    x = float(geom.get('x', 0))
                    y = float(geom.get('y', 0))
                    w = float(geom.get('width', 0))
                    h = float(geom.get('height', 0))
                    bounds = (x, y, w, h)
                except ValueError as e:
                    logger.warning(f"Invalid geometry for node {vid}: {e}")
            graph.add_node(vid, text, ntype, bounds)

    for cell in root.findall('.//mxCell'):
        if cell.get('edge') == '1':
            src = cell.get('source')
            dst = cell.get('target')
            style = parse_style(cell.get('style', ''))
            if not dst:
                geom = cell.find('mxGeometry')
                if geom is not None:
                    pt = geom.find("mxPoint[@as='targetPoint']")
                    if pt is not None:
                        try:
                            px = float(pt.get('x', 0))
                            py = float(pt.get('y', 0))
                            for node in graph.nodes.values():
                                if node.bounds:
                                    x, y, w, h = node.bounds
                                    if x <= px <= x + w and y <= py <= y + h:
                                        dst = node.id
                                        break
                        except ValueError:
                            logger.warning("Invalid target point coordinates")
            if not src or not dst:
                logger.warning(f"Incomplete edge: src={src}, dst={dst}")
                continue
            stroke_color = style.get('strokecolor', '')
            cond = 'false' if stroke_color == '#b85450' else 'true'
            graph.add_edge(src, dst, cond)

    if not graph.start_node_id:
        logger.error("No start node found in diagram")
        raise ValueError("Missing start node")
    if not graph.end_nodes:
        logger.warning("No end nodes found in diagram")

    return graph


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Parse draw.io XML to graph and print structure")
    parser.add_argument("xml_file", help="Path to .drawio XML file")
    parser.add_argument("-v", "--verbose", action="store_true", help="Enable verbose logging")
    args = parser.parse_args()

    if args.verbose:
        logger.setLevel(logging.DEBUG)

    try:
        graph = parse_xml_to_graph(args.xml_file)
        graph.print_graph()
    except Exception as e:
        logger.critical(f"Parsing failed: {e}")
        exit(1)


if __name__ == '__main__':
    main()
