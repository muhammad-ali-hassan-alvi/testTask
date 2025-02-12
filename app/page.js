"use client";

import React, { useState, useCallback } from "react";
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import "tailwindcss/tailwind.css";

const nodeSchema = z.object({
  type: z.enum(["user", "habit"], { required_error: "Type is required" }),
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(20, "Name must be at most 20 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username is too long")
    .optional(),
  habit: z.enum(["Reading", "Exercise", "Meditation"]).optional(),
});

const initialNodes = [
  { id: "1", type: "default", position: { x: 150, y: 50 }, data: { label: "User Node: Alice" } },
];

const initialEdges = [];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(nodeSchema),
  });

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge({ ...connection, animated: true, style: { stroke: "#4f46e5" } }, eds)),
    [setEdges]
  );

  const saveNode = (data) => {
    if (selectedNode) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === selectedNode.id
            ? {
                ...node,
                data: {
                  ...node.data,
                  label: `${data.type === "user" ? "User Node" : "Habit Node"}: ${data.name}${
                    data.habit ? ` (${data.habit})` : ""
                  }`,
                },
              }
            : node
        )
      );
    } else {
      addNewNode(data);
    }
    reset();
    setIsPanelOpen(false);
    setSelectedNode(null);
  };

  const addNewNode = (data = { type: "user", name: "New Node" }) => {
    const id = `${nodes.length + 1}`;
    const newNode = {
      id,
      type: "default",
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: `${data.type === "user" ? "User Node" : "Habit Node"}: ${data.name}${
          data.habit ? ` (${data.habit})` : ""
        }`,
      },
    };

    setNodes((nds) => [...nds, newNode]);

    if (nodes.length > 0) {
      setEdges((eds) =>
        addEdge(
          {
            id: `e${nodes[nodes.length - 1].id}-${id}`,
            source: nodes[nodes.length - 1].id,
            target: id,
            style: { stroke: "#4f46e5" },
          },
          eds
        )
      );
    }
  };

  const handleNodeClick = (event, node) => {
    setSelectedNode(node);
    setIsPanelOpen(true);

    const [nodeType, nodeName] = node.data.label.split(": ");
    const habit = nodeName.includes("(") ? nodeName.split("(")[1].replace(")", "") : "";

    setValue("type", nodeType === "User Node" ? "user" : "habit");
    setValue("name", nodeName.replace(` (${habit})`, ""));
    setValue("habit", habit || "");
  };

  return (
    <ReactFlowProvider>
      <div className="flex h-screen">
        <div className="flex-1 border-r border-gray-300">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            fitView
          >
            <Background color="#e5e7eb" />
            <Controls />
            <MiniMap nodeColor={() => "#4f46e5"} />
          </ReactFlow>
        </div>

        <div className="w-80 p-6 bg-gray-100">
          <h3 className="text-xl text-black font-semibold mb-4">
            {selectedNode ? "Edit Node" : "Add New Node"}
          </h3>
          <form onSubmit={handleSubmit(saveNode)} className="space-y-4">
            <div>
              <label className="block text-sm text-black font-medium ">Type</label>
              <select {...register("type")} className="w-full p-2 border rounded-md text-black">
                <option value="user">User Node</option>
                <option value="habit">Habit Node</option>
              </select>
              {errors.type && <p className="text-red-600 text-sm">{errors.type.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Node Name</label>
              <input type="text" {...register("name")} className="w-full p-2 border rounded-md text-black" />
              {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
            </div>
            {watch("type") === "habit" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Habit</label>
                <select {...register("habit")} className="w-full p-2 border rounded-md text-black">
                  <option value="">Select a Habit</option>
                  <option value="Reading">Reading</option>
                  <option value="Exercise">Exercise</option>
                  <option value="Meditation">Meditation</option>
                </select>
                {errors.habit && <p className="text-red-600 text-sm">{errors.habit.message}</p>}
              </div>
            )}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {selectedNode ? "Update Node" : "Save Node"}
            </button>
          </form>

          <button
            onClick={() => addNewNode()}
            className="w-full mt-4 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Add New Node
          </button>
        </div>
      </div>
    </ReactFlowProvider>
  );
}
