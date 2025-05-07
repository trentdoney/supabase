import { GuideTemplate } from '~/features/docs/GuidesMdx.template'
import {
  genGuideMeta,
  genGuidesStaticParams,
  getGuidesMarkdown,
} from '~/features/docs/GuidesMdx.utils'

export const dynamicParams = false

type Params = { slug?: string[] }

const PGReplicateGuidePage = async ({ params }: { params: Params }) => {
  const slug = ['pg_replicate', ...(params.slug ?? [])]
  const data = await getGuidesMarkdown(slug)

  return <GuideTemplate {...data!} />
}

const generateStaticParams = genGuidesStaticParams('pg_replicate')
const generateMetadata = genGuideMeta((params: { slug?: string[] }) =>
  getGuidesMarkdown(['pg_replicate', ...(params.slug ?? [])])
)

export default PGReplicateGuidePage
export { generateMetadata, generateStaticParams }
