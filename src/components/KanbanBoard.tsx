"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { BoardColumn, BoardContainer } from "./BoardColumn";
import {
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	DragOverlay,
	type DragStartEvent,
	useSensor,
	useSensors,
	KeyboardSensor,
	Announcements,
	UniqueIdentifier,
	TouchSensor,
	MouseSensor,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { type Task, TaskCard } from "./TaskCard";
import type { Column } from "./BoardColumn";
import { hasDraggableData } from "./utils";
import { coordinateGetter } from "./mainContainersKeyboardPreset";

const defaultCols = [
	{
		id: "todo" as const,
		title: "Todo",
	},
	{
		id: "in-progress" as const,
		title: "In progress",
	},
	{
		id: "done" as const,
		title: "Done",
	},
] satisfies Column[];

export type ColumnId = (typeof defaultCols)[number]["id"];

const initialTasks: Task[] = [
	{
		id: "task1",
		columnId: "done",
		description: "Project initiation and planning",
		priority: 0,
		deadline: new Date(2023, 1, 1),
	},
	{
		id: "task2",
		columnId: "done",
		description: "Gather requirements from stakeholders",
		priority: 1,
		deadline: new Date(2023, 2, 1),
	},
	{
		id: "task3",
		columnId: "done",
		description: "Create wireframes and mockups",
		priority: 2,
		deadline: new Date(2023, 2, 1),
	},
	{
		id: "task4",
		columnId: "in-progress",
		description: "Develop homepage layout",
		priority:0,
		deadline: new Date(2023, 2, 1),
	},
	{
		id: "task5",
		columnId: "in-progress",
		description: "Design color scheme and typography",
		priority: 1,
		deadline: new Date(2023, 3, 1),
	},
	{
		id: "task6",
		columnId: "todo",
		description: "Implement user authentication",
		priority: 0,
		deadline: new Date(2023, 4, 1),
	},
	{
		id: "task7",
		columnId: "todo",
		description: "Build contact us page",
		priority: 1,
		deadline: new Date(2023, 5, 1),
	},
	{
		id: "task8",
		columnId: "todo",
		description: "Create product catalog",
		priority: 2,
		deadline: new Date(2023, 6, 1),
	},
	{
		id: "task9",
		columnId: "todo",
		description: "Develop about us page",
		priority: 0,
		deadline: new Date(2023, 7, 1),
	},
	{
		id: "task10",
		columnId: "todo",
		description: "Optimize website for mobile devices",
		priority: 1,
		deadline: new Date(2023, 8, 1),
	},
	{
		id: "task11",
		columnId: "todo",
		description: "Integrate payment gateway",
		priority: 2,

	},
	{
		id: "task12",
		columnId: "todo",
		description: "Perform testing and bug fixing",
		priority: 0,
		deadline: new Date(2023, 10, 1),
	},
	{
		id: "task13",
		columnId: "todo",
		description: "Launch website and deploy to server",
		priority: 1,
		deadline: new Date(2023, 11, 1),
	},
];



function sortTasks(tasks: Task[]): Task[] {
	const answer = tasks.sort((taskA, taskB) => {
		if (taskA.priority === taskB.priority) {
			if (!taskA.deadline) {
				return 1;
			}
			if (!taskB.deadline) {
				return -1;
			}

			return taskA.deadline.getTime() - taskB.deadline.getTime();
		}
		return taskA.priority - taskB.priority;
	});

	return answer;
}



export function KanbanBoard() {
	const [columns, setColumns] = useState<Column[]>(defaultCols);
	const pickedUpTaskColumn = useRef<ColumnId | null>(null);
	const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

	const [tasks, setTasks] = useState<Task[]>(initialTasks);

	const [activeColumn, setActiveColumn] = useState<Column | null>(null);

	const [activeTask, setActiveTask] = useState<Task | null>(null);

	const sensors = useSensors(
		useSensor(MouseSensor),
		useSensor(TouchSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: coordinateGetter,
		}),
	);

	useEffect(() => {
		setTasks(sortTasks(tasks));
	}, [tasks]);

	function getDraggingTaskData(taskId: UniqueIdentifier, columnId: ColumnId) {
		const tasksInColumn = tasks.filter((task) => task.columnId === columnId);
		const taskPosition = tasksInColumn.findIndex((task) => task.id === taskId);
		const column = columns.find((col) => col.id === columnId);
		return {
			tasksInColumn,
			taskPosition,
			column,
		};
	}

	const announcements: Announcements = {
		onDragStart({ active }) {
			if (!hasDraggableData(active)) return;
			if (active.data.current?.type === "Column") {
				const startColumnIdx = columnsId.findIndex((id) => id === active.id);
				const startColumn = columns[startColumnIdx];
				return `Picked up Column ${startColumn?.title} at position: ${startColumnIdx + 1} of ${columnsId.length}`;
			} else if (active.data.current?.type === "Task") {
				pickedUpTaskColumn.current = active.data.current.task.columnId;
				const { tasksInColumn, taskPosition, column } = getDraggingTaskData(active.id, pickedUpTaskColumn.current);
				return `Picked up Task ${active.data.current.task.description} at position: ${taskPosition + 1} of ${tasksInColumn.length} in column ${column?.title}`;
			}
		},
		onDragOver({ active, over }) {
			if (!hasDraggableData(active) || !hasDraggableData(over)) return;

			if (active.data.current?.type === "Column" && over.data.current?.type === "Column") {
				const overColumnIdx = columnsId.findIndex((id) => id === over.id);
				return `Column ${active.data.current.column.title} was moved over ${over.data.current.column.title} at position ${overColumnIdx + 1} of ${columnsId.length}`;
			} else if (active.data.current?.type === "Task" && over.data.current?.type === "Task") {
				const { tasksInColumn, taskPosition, column } = getDraggingTaskData(over.id, over.data.current.task.columnId);
				if (over.data.current.task.columnId !== pickedUpTaskColumn.current) {
					return `Task ${active.data.current.task.description} was moved over column ${column?.title} in position ${taskPosition + 1} of ${tasksInColumn.length}`;
				}
				return `Task was moved over position ${taskPosition + 1} of ${tasksInColumn.length} in column ${column?.title}`;
			}
		},
		onDragEnd({ active, over }) {
			if (!hasDraggableData(active) || !hasDraggableData(over)) {
				pickedUpTaskColumn.current = null;
				return;
			}
			if (active.data.current?.type === "Column" && over.data.current?.type === "Column") {
				const overColumnPosition = columnsId.findIndex((id) => id === over.id);

				return `Column ${active.data.current.column.title} was dropped into position ${overColumnPosition + 1} of ${columnsId.length}`;
			} else if (active.data.current?.type === "Task" && over.data.current?.type === "Task") {
				const { tasksInColumn, taskPosition, column } = getDraggingTaskData(over.id, over.data.current.task.columnId);
				if (over.data.current.task.columnId !== pickedUpTaskColumn.current) {
					return `Task was dropped into column ${column?.title} in position ${taskPosition + 1} of ${tasksInColumn.length}`;
				}
				return `Task was dropped into position ${taskPosition + 1} of ${tasksInColumn.length} in column ${column?.title}`;
			}
			pickedUpTaskColumn.current = null;

			setTasks((tasks) => tasks.sort((a, b) => {
				return a.priority - b.priority;
			}))
		},
		onDragCancel({ active }) {
			pickedUpTaskColumn.current = null;
			if (!hasDraggableData(active)) return;
			return `Dragging ${active.data.current?.type} cancelled.`;
		},
	};

	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		setIsLoading(false);

	}, []);

	return (
		<DndContext
			accessibility={{
				announcements,
			}}
			sensors={sensors}
			onDragStart={onDragStart}
			onDragEnd={onDragEnd}
			onDragOver={onDragOver}
		>
			<BoardContainer>
				<SortableContext items={columnsId}>
					{columns.map((col) => (
						<BoardColumn
							key={col.id}
							column={col}
							tasks={tasks.filter((task) => task.columnId === col.id)}
						/>
					))}
				</SortableContext>
			</BoardContainer>

			{!isLoading &&
				createPortal(
					<DragOverlay>
						{activeColumn && (
							<BoardColumn
								isOverlay
								column={activeColumn}
								tasks={tasks.filter((task) => task.columnId === activeColumn.id)}
							/>
						)}
						{activeTask && (
							<TaskCard
								task={activeTask}
								isOverlay
							/>
						)}
					</DragOverlay>,
					document.body,
				)}
		</DndContext>
	);

	function onDragStart(event: DragStartEvent) {
		if (!hasDraggableData(event.active)) return;
		const data = event.active.data.current;
		if (data?.type === "Column") {
			setActiveColumn(data.column);
			return;
		}

		if (data?.type === "Task") {
			setActiveTask(data.task);
			return;
		}
	}

	function onDragEnd(event: DragEndEvent) {
		setActiveColumn(null);
		setActiveTask(null);

		const { active, over } = event;
		if (!over) return;

		const activeId = active.id;
		const overId = over.id;

		if (!hasDraggableData(active)) return;

		const activeData = active.data.current;

		if (activeId === overId) return;

		const isActiveAColumn = activeData?.type === "Column";
		if (!isActiveAColumn) return;

		setColumns((columns) => {
			const activeColumnIndex = columns.findIndex((col) => col.id === activeId);

			const overColumnIndex = columns.findIndex((col) => col.id === overId);

			return arrayMove(columns, activeColumnIndex, overColumnIndex);
		});
	}

	function onDragOver(event: DragOverEvent) {
		const { active, over } = event;
		if (!over) return;

		const activeId = active.id;
		const overId = over.id;

		if (activeId === overId) return;

		if (!hasDraggableData(active) || !hasDraggableData(over)) return;

		const activeData = active.data.current;
		const overData = over.data.current;

		const isActiveATask = activeData?.type === "Task";
		const isOverATask = overData?.type === "Task";

		if (!isActiveATask) return;

		// Im dropping a Task over another Task
		if (isActiveATask && isOverATask) {
			setTasks((tasks) => {
				const activeIndex = tasks.findIndex((t) => t.id === activeId);
				const overIndex = tasks.findIndex((t) => t.id === overId);
				const activeTask = tasks[activeIndex];
				const overTask = tasks[overIndex];
				if (activeTask && overTask && activeTask.columnId !== overTask.columnId) {
					activeTask.columnId = overTask.columnId;
					return arrayMove(tasks, activeIndex, overIndex - 1);
				}

				return arrayMove(tasks, activeIndex, overIndex);
			});
		}

		const isOverAColumn = overData?.type === "Column";

		// Im dropping a Task over a column
		if (isActiveATask && isOverAColumn) {
			setTasks((tasks) => {
				const activeIndex = tasks.findIndex((t) => t.id === activeId);
				const activeTask = tasks[activeIndex];
				if (activeTask) {
					activeTask.columnId = overId as ColumnId;
					return arrayMove(tasks, activeIndex, activeIndex);
				}
				return tasks;
			});
		}
	}
}
