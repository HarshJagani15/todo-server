import { ITodo } from "../models/todo-model";

interface Params {
  search: string;
  searchFields: string[];
}

export class QueryHelper<T extends { todos: ITodo[] }> {
  private data: T[];

  constructor(data: T[]) {
    this.data = data;
  }

  applyQuery(params: Params) {
    let panels = [...this.data];
    if (params.search && params.searchFields?.length) {
      panels = panels.map((panel) => ({
        ...panel,
        todos: panel.todos.filter((todo) =>
          params.searchFields!.some((field) =>
            String(todo[field as keyof ITodo])
              .toLowerCase()
              .includes(params.search!.toLowerCase())
          )
        ),
      }));
    }

    return panels;
  }
}
