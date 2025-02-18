import React from 'react'
import Link from 'next/link'

import { config } from 'config/config'

const Footer = (): React.ReactElement => (
  <footer>
    <span>
      <Link href='/about'>About {config.appName}</Link>
      {' | '}
      By <a href='https://www.mohitpatel.life' target='_blank' rel='noopener noreferrer'>Mohit</a>
      <MohitLogo />
      {' | '}
      <a href={`mailto:mohit@teziapp.com`} target='_blank' rel='noopener noreferrer'>Contact</a>
    </span>
    <style jsx>{`
      :global(main) {
        margin-bottom: 3em;
      }

      footer {
        color: #777777;
        height: unset;
        padding: 0.4em 0.5em 0.6em;
        text-align: center;
      }

      footer :global(a) {
        color: inherit;
        border-color: inherit;
      }
    `}
    </style>
  </footer>
)
export default Footer

const MohitLogo = (): React.ReactElement => (
  <a href='https://www.mohitpatel.life' target='_blank' rel='noopener noreferrer' className='no-link'>
    <img
      src='/mohit.png'
      alt='Mohit'
      title='Mohit'
    />
    <style jsx>{`
      a {
        margin-left: 0.2em;
        border-bottom: none;
      }
      img {
        width: 18px;
        height: 18px;
        vertical-align: bottom;
      }
    `}
    </style>
  </a>
)
