import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cva } from "class-variance-authority";
import { GripVertical, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ColumnId } from "./KanbanBoard";
import { MouseEventHandler } from "react";

export interface Task {
	id: UniqueIdentifier;
	columnId: ColumnId;
	description?: string;
	priority: 0 | 1 | 2; // high, medium, low  , so we can sort by priority . just like kernels :) 
	deadline? : Date ;
	
}

interface TaskCardProps {
	task: Task;
	isOverlay?: boolean;
	deleteOnClick: MouseEventHandler<HTMLButtonElement>;
}

export type TaskType = "Task";

export interface TaskDragData {
	type: TaskType;
	task: Task;
}

export function TaskCard({ task, isOverlay , deleteOnClick  }: TaskCardProps) {
	const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
		id: task.id,
		data: {
			type: "Task",
			task,
		} satisfies TaskDragData,
		attributes: {
			roleDescription: "Task",
		},
	});

	const style = {
		transition,
		transform: CSS.Translate.toString(transform),
	};

	const variants = cva("", {
		variants: {
			dragging: {
				over: "ring-2 opacity-30",
				overlay: "ring-2 ring-primary",
			},
		},
	});

	return (
		<Card
			ref={setNodeRef}
			style={style}
			className={variants({
				dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
			})}
		>
			<CardHeader className="px-3 py-3 space-between flex flex-row border-b-2 border-secondary relative">
				<Button
					variant={"ghost"}
					{...attributes}
					{...listeners}
					className="p-1 text-secondary-foreground/50 -ml-2 h-auto cursor-grab"
				>
					<span className="sr-only">Move task</span>
					<GripVertical />
				</Button>

				<Badge
					variant={"outline"}
					className={`ml-auto font-semibold ${task.priority === 0 ? "bg-red-500" : task.priority === 1 ? "bg-yellow-500" : "bg-green-500"}`}
				>
					{task.priority === 0 ? "High" : task.priority === 1 ? "Medium" : "Low"}
				</Badge>

				{task.deadline && (
					<Badge
						variant={"outline"}
						className="ml-auto font-semibold"
					>
						Deadline: {task.deadline?.toLocaleDateString()}
					</Badge>
				)}

				<Button
					onClick={deleteOnClick}
					variant={"ghost"}
					size={"sm"}
					className=""
				>
					<Trash  className="font-xs"/>
				</Button>
			</CardHeader>
			<CardContent className="px-3 pt-3 pb-6 text-left whitespace-pre-wrap">{task.description ?? <i className="text-slate-400">No Description</i>}</CardContent>
		</Card>
	);
}
