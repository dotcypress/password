import React from 'react'
import Head from 'next/head'
import copy from 'copy-to-clipboard'
import pbkdf2 from 'pbkdf2'

const bookmarklet = `javascript:window.open('https://password.now.sh/#' + new URL(document.location).host, '_blank');`
const alphabetRFC1924 = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '!', '#', '$', '%', '&', '(', ')', '*', '+', '-', ';', '<', '=', '>', '?', '@', '^', '_', '`', '{', '|', '}', '~']
const emojies = require('./emoji-db')

export default class extends React.Component {
  constructor (props) {
    super(props)
    this.generate = this.generate.bind(this)
    this.copy = this.copy.bind(this)
    this.keydown = this.keydown.bind(this)
    this.togglePasswordVisibility = this.togglePasswordVisibility.bind(this)
    this.state = { 
      password: '',
      hint: [417, 408, 729, 534],
      showPassword: false 
    }
  }

  componentDidMount () {
    if (document.referrer) {
      this.tldInput.value = new URL(document.referrer).host.replace(/^www./, '')
    }
    if (document.location.hash) {
      this.tldInput.value = document.location.hash.slice(1).replace(/^www./, '')
    }
    this.generate()
  }

  togglePasswordVisibility () {
    const { showPassword } = this.state
    this.setState({ showPassword: !showPassword }, () => this.generate())
  }

  generate () {
    const { showPassword } = this.state
    const masterPassword = this.masterPasswordInput.value
    const salt = `${this.tldInput.value}${this.usernameInput.value}`
    const keyIndex = parseInt(this.devivationInput.value) || 0
    const derived = pbkdf2.pbkdf2Sync(masterPassword, salt, 1000 + keyIndex, 16, 'sha256')
    const password = Array.from(derived).map((byte) => alphabetRFC1924[byte % alphabetRFC1924.length]).join('')
    const hint =  new Array(4).fill('').map((value, index) => derived.readUInt32BE(index * 4) % emojies.length)
    this.setState({ password, hint })
  }

  copy () {
    copy(this.state.password)
    this.passwordEl.style.animationName = 'flash'
    setTimeout(() => {
      if (this.passwordEl) {
        this.passwordEl.style.animationName = ''
      }
    }, 1500)
  }

  keydown (ev) {
    if (ev.keyCode == 13) {
      this.copy()
      if (ev.metaKey) {
        window.close()
      }
    }
  }

  render () {
    const { password, hint, showPassword } = this.state
    return (
      <div>
        <Head>
          <title>~ psswrd</title>
          <meta name='viewport' content='initial-scale=1.0, maximum-scale=1, width=device-width' />
          <link rel="apple-touch-icon" sizes='180x180' href='/static/apple-touch-icon.png' />
          <link rel='icon' type='image/png' sizes='32x32' href='/static/favicon-32x32.png' />
          <link rel='icon' type='image/png' sizes='16x16' href='/static/favicon-16x16.png' />
          <link rel='manifest' href='/static/manifest.json' />
          <link rel='mask-icon' href='/static/safari-pinned-tab.svg' color='#f9b05d' />
          <meta name='theme-color' content='#ffffff' />
        </Head>
        <div className='app'>
          <a className='bookmarklet' href={bookmarklet} onClick={(e) => e.preventDefault()}>~ psswrd<sup>2.0</sup></a>
          <div>
            <input id='tld' type='text' placeholder='tld' autoCapitalize='none' onKeyDown={this.keydown} onChange={this.generate} ref={(input) => { this.tldInput = input }} />
            <input id='username' type='text' placeholder='username' autoCapitalize='none' autoFocus onKeyDown={this.keydown} onChange={this.generate} ref={(input) => { this.usernameInput = input }} />
            <div className='setup'>
              <input type='password' placeholder='master password' onKeyDown={this.keydown} onChange={this.generate} ref={(input) => { this.masterPasswordInput = input }} />
              <div className='derivation'>
                <input type='number' min='0' placeholder='#' onKeyDown={this.keydown} onChange={this.generate} ref={(input) => { this.devivationInput = input }} />
              </div>
            </div>
            <div className='result' ref={(el) => { this.passwordEl = el }}>
              {showPassword && <div className='password'>{password}</div>}
              {!showPassword && <div>
                <div className='hint'>
                  {hint.map((pos, idx) => <div key={idx} style={{ marginTop: -pos * 32 }}>
                    {emojies.map((symbol) => <div key={`${idx}${symbol}`} className='emoji'>{symbol}</div>)}
                  </div>)}                
                </div>
              </div>}
              <div className='actions'>
                <button onClick={this.togglePasswordVisibility}>
                  {showPassword
                    ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z "></path></svg>
                    : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM8.9 6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2H8.9V6zM18 20H6V10h12v10z "></path></svg>
                  }  
                </button>
                <button onClick={this.copy}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z "></path></svg>
                </button>
              </div>
            </div>
          </div>
          <a className='github' href='https://github.com/dotcypress/password'>github</a>
        </div>
        <style jsx global>{`
          * {
            box-sizing: border-box;
            text-rendering: geometricPrecision;
          }

          html {
            background: #2e353e;
          }

          body {
            font-family: Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif;
            margin: 0;
          }

          .app {
            padding: 6px 12px;
          }

          .bookmarklet {
            display: inline-block;
            color: #f9b05d;
            font-size: 20px;
            font-weight: bold;
            text-decoration: none;
            margin-bottom: 12px;
          }

          .bookmarklet sup {
            padding: 4px;
            color: #e2ca46;
            font-size: 10px;
          }

          .github {
            display: block;
            margin-top: 24px;
            color: #bbbbbb;
            text-align: center;
            font-size: 10px;
          }

          input {
            background: none;
            color: #57a1c7;
            font-family: Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif;
            font-size: 18px;
            width: 100%;
            padding: 6px 0;
            border: none;
            outline: none;
            text-shadow: 0px 0px 0px #000;
          }

          .result {
            color: #99c794;
            border: double 6px #e77777;
            border-radius: 0;
            font-size: 18px;
            line-height: 20px;
            margin-top: 12px;
            min-height: 42px;
            animation-duration: 700ms;
            animation-fill-mode: both;
            position: relative;
            text-align: center;
          }

          .result .password {
            padding: 6px;
          }

          .result .hint {
            display: flex;
            overflow-x: hidden;
            position: relative;
            height: 32px;
            justify-content: center;
          }

          .result .hint > div {
            transition: margin-top 0.3s cubic-bezier(0,1,.95,.95);
          }
          
          .result .hint .emoji {
            height: 32px;
            padding: 8px 4px;
          }

          .setup {
            position: relative;
          }

          .setup .derivation {
            position: absolute;
            right: 0;
            top: 0;
            margin: 0;
          }
          
          .setup .derivation input {
            width: 48px;
            text-align: end;
            line-height: 20px;
          }
         
          .result .actions {
            position: absolute;
            right: 12px;
            top: 6px;
            margin: -6px -12px;
          }

          .result .actions svg {
            fill: #f9b05d;
            opacity: 0.7;
            margin-top: 2px;
          }
          
          .result .actions button:hover svg {
            fill: #e2ca46;
            opacity: 1;
          }
          
          .result button {
            cursor: pointer;
            font-family: Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif;
            background: none;
            border: none;
            outline: none;
            margin: 4px 0;
          }

          .result button:hover {
            color: #e2ca46;
          }

          @keyframes flash {
            from, 50%, to {
              opacity: 1
            }

            25%, 75% {
              opacity: 0.3;
            }
          }

          @media (min-width: 420px) {
            .app {
              padding: 32px 12px;
              width: 380px;
              margin: auto;
            }
          }
        `}</style>
      </div>
    )
  }
}

