import type { ComputedRef, MaybeRef } from 'vue'
export type LayoutKey = "default" | "worker"
declare module 'nuxt/app' {
  interface PageMeta {
    layout?: MaybeRef<LayoutKey | false> | ComputedRef<LayoutKey | false>
  }
}