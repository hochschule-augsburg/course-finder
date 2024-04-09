import type { Store, StoreDefinition } from 'pinia'
import type { Mock } from 'vitest'

export function mockedStore<TStoreDef extends () => unknown>(
  useStore: TStoreDef,
): TStoreDef extends StoreDefinition<
  infer Id,
  infer State,
  infer Getters,
  infer Actions
>
  ? Store<
      Id,
      State,
      Getters,
      {
        [K in keyof Actions]: Actions[K] extends (
          ...args: infer Args
        ) => infer ReturnT
          ? // 👇 depends on your testing framework
            Mock<Args, ReturnT>
          : Actions[K]
      }
    >
  : ReturnType<TStoreDef> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useStore() as any
}
