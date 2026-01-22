export interface BaseComponentConfigProps<T = any> {
  config: T;
  onUpdate: (field: keyof T | Partial<T>, value?: any) => void;
}

export interface BaseComponentProps<T = any> {
  config: T;
}
