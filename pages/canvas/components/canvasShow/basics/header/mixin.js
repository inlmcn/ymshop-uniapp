import { funMixin } from '../../config/mixin'

export default function () {
  const { jumpLink, toSearch } = funMixin()
  return {
    jumpLink,
    toSearch
  }
}
