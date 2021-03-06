import { useEffect, useState } from 'react'
import { Main, Footer, Button } from '@components'
import { gitInit, wipe, clone } from '@utils'

import styles from './Auth.module.css'

const Auth = ({authorized, setAuthorized}) => {

  const [formUrl, setUrl] = useState("")
  const [formToken, setToken] = useState("")

  // clone git repo and hide authorization
  async function authorize(url, token) {
    try {
      await clone(url, token)

      window.localStorage.setItem('antea_url', url)
      window.localStorage.setItem('antea', true)

      if (token === "") {
          // remember that read access does not require a token
          window.localStorage.setItem('antea_public', true)
      }

      setAuthorized(true)
    } catch (e) {
      // clean up if git initialization failed
      await wipe()
      console.log(e)
    }
  }

  useEffect(() => {
    (async () => {

      gitInit()

      if (window.localStorage.getItem('antea')) {
        setAuthorized(true)
      }

      // serve from /git on local
      if (process.env.REACT_APP_BUILD_MODE === "local") {
        try {
          await authorize("http://" + window.location.host + "/git/.git", "")
        } catch(e) {
          console.log("failed to clone from local", e)
          return
        }
      }

      // read url from path
      let searchParams = new URLSearchParams(window.location.search);
      if (searchParams.has('url')) {
        let barUrl = searchParams.get('url')
        setUrl(barUrl)
        // remove url from address bar
        window.history.replaceState(null, null, "/");
        // try to login read-only to a public repo from address bar
        try {
          await authorize(barUrl, "")
        } catch(e) {
          console.log("failed to clone from address bar", e)
        }
      }
    })()
  }, [])

  return (
    <>
      <Main>
        <div className={styles.container}>
          <form>
            <div>
              <input
                className={styles.input}
                type="text"
                value={formUrl}
                placeholder="url"
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div>
              <input
                className={styles.input}
                type="password"
                value={formToken}
                placeholder="key"
                onChange={(e) => setToken(e.target.value)}
              />
            </div>
          </form>
          <br/>
          <Button type="button" onClick={() => authorize(formUrl, formToken)}>Login</Button>
        </div>
      </Main>
      <Footer />
    </>
  )
}

export default Auth
