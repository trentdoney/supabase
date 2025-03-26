import type { Database } from 'common'

type Tables = Database['public']['Tables']
type TableNames = keyof Tables

export interface DbPersisted<TableData extends Tables[TableNames]> {}
