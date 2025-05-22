import React from 'react'
import type { GetStaticPropsContext, GetStaticPropsResult } from 'next'
import Image from 'next/image'

import { PageProps } from 'components/page/PageHead'
import { useSite } from 'contexts/SiteContext'

const AboutPage: React.FC<PageProps> = ({ title }) => {
  const { siteConfig } = useSite()
  return (
    <div className='about'>
      <div className='column'>
        <Image
          src={siteConfig.logo}
          alt={siteConfig.name}
          width={150}
          height={150}
          className='avatar'
        />
        <div>
          <h1>{title}</h1>
          <p>
            I created <strong>{siteConfig.name}'s Life</strong> because I'm forgetting who I am. Who I was, What I did, What I am supposed to do.
            I'll come to this website for direction.
          </p>          
        </div>
      </div>
      <style jsx>{`
        .about {
          padding: 2rem;
          margin: auto;
          max-width: 800px;
        }
        .column {
          display: flex;
          align-items: flex-start;
        }
        .about :global(.avatar) {
          border-radius: 50%;
          margin-right: 1.5rem;
        }
        a {
          font-weight: bold;
        }

        @media (max-width: 600px) {
          .column {
            flex-direction: column;
          }
          .about :global(.avatar) {
            border-radius: 50%;
            margin: 0 auto 1em;
          }
        }
      `}
      </style>
    </div>
  )
}
export default AboutPage

export async function getStaticProps ({ params }: GetStaticPropsContext): Promise<GetStaticPropsResult<PageProps>> {
  return {
    props: {
      title: 'About',
      description: `I created this site because I've always been passionate about building fast, modern web apps using the best technology out there.`
    }
  }
}
