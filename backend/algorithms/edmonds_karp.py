from collections import deque


def edmonds_karp(graph, source, sink, return_residual=False):
    n = len(graph)
    residual = [row[:] for row in graph]
    parent = [-1] * n
    max_flow = 0

    def bfs():
        visited = [False] * n
        queue = deque([source])
        visited[source] = True

        while queue:
            u = queue.popleft()

            for v in range(n):
                if not visited[v] and residual[u][v] > 0:
                    visited[v] = True
                    parent[v] = u

                    if v == sink:
                        return True

                    queue.append(v)

        return False

    while bfs():
        path_flow = float("inf")
        v = sink

        while v != source:
            u = parent[v]
            path_flow = min(path_flow, residual[u][v])
            v = u

        v = sink

        while v != source:
            u = parent[v]
            residual[u][v] -= path_flow
            residual[v][u] += path_flow
            v = u

        max_flow += path_flow

    if return_residual:
        return max_flow, residual

    return max_flow