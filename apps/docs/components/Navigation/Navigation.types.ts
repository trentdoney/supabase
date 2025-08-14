export interface NavMenu {
  [key: string]: NavMenuGroup[]
}

export interface NavMenuGroup {
  label: string
  items: NavMenuSection[]
}

export interface NavMenuSection {
  name: string
  url?: `/${string}` | `https://${string}`
  items: Partial<NavMenuSection>[]
  /** Whether to show this section (default true) */
  showIf?: boolean
}

type MenuItem = {
  label: string
  icon?: string
  href?: `/${string}` | `https://${string}`
  level?: string
  hasLightIcon?: boolean
  community?: boolean
  /** Whether to show this menu item (default true) */
  showIf?: boolean
}

export type DropdownMenuItem = MenuItem & {
  menuItems?: MenuItem[][]
}

export type GlobalMenuItems = DropdownMenuItem[][]

export type NavMenuConstant = Readonly<{
  title: string
  icon: string
  url?: `/${string}`
  items: ReadonlyArray<Partial<NavMenuSection>>
}>
