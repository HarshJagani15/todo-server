interface Params {
  search: string;
  searchFields: string[];
}

export class QueryHelper<T> {
  private data: any;

  constructor(data: T[]) {
    this.data = data;
  }

  applyQuery(params: Params) {
    let panels = [...this.data];
    if (params.search && params.searchFields?.length) {
      panels = panels.map((panel) => ({
        ...panel,
        todos: panel.todos.filter((todo: any) =>
          params.searchFields!.some((field: any) =>
            String(todo[field])
              .toLowerCase()
              .includes(params.search!.toLowerCase())
          )
        ),
      }));
    }

    return panels;
  }
}
