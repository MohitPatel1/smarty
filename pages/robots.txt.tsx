import { NextPage, GetServerSidePropsContext } from 'next'
import { useSite } from 'contexts/SiteContext'

const robotsTxt = `# robotstxt.org

User-agent: *

Sitemap: /sitemap.xml`

const RobotsTxt: NextPage = () => null

export const getServerSideProps = async ({ res }: GetServerSidePropsContext) => {
  res.setHeader('Content-Type', 'text/plain')
  res.write(robotsTxt)
  res.end()
  return { props: {} }
}

export default RobotsTxt
