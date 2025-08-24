import 'pinia'
import { PersistOptions } from 'pinia-plugin-persistedstate'

// This tells TypeScript that any store defined using defineStore
// can optionally have a 'persist' property.
declare module 'pinia' {
  export interface DefineStoreOptions<Id, S, G, A> {
    persist?: PersistOptions
  }
}