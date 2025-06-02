import { styleText } from 'util'

export class TaggedLogger {
  constructor(private readonly tag: string) {}

  log(message: string) {
    console.log(`${styleText('blue', `[${this.tag}]`)} ${message}`)
  }

  error(message: string) {
    console.error(`${styleText('red', `[${this.tag}]`)} ${message}`)
  }
}
