import React, { useEffect, useState } from 'react'
import cn from 'classnames'
import { Title, Paragraph, Button, Link } from '@components'
import { formatDate, isIFrameable, resolveLFS, toHtml } from '@utils'
import styles from './Sidebar.module.css'

const Sidebar = (props) => {

  let { event: newEvent,
        onClose: handleClose,
        eventIndex } = props

  const [event, setEvent] = useState(newEvent)
  const [assetPath, setAssetPath] = useState(undefined);
  const [docPath, setDocPath] = useState(undefined);
  const [datum, setDatum] = useState("")

  const resolvePathLocal = async (e = event) => {
    let filePath = ""
    let localpath = "/api/local/" + e.FILE_PATH
    if ((await fetch(localpath)).ok) {
      filePath = localpath
    }
    let lfspath = "/api/lfs/" + e.FILE_PATH
    if ((await fetch(lfspath)).ok) {
      filePath = lfspath
    }
    setAssetPath(filePath)
  }

  const resolvePathLFS = async (token, e = event) => {
    let url = window.localStorage.getItem('antea_url')
    let lfspath_local = "lfs/" + e.FILE_PATH
    let blobPath = await resolveLFS(lfspath_local, url, token)
    setAssetPath(blobPath)
  }

  const handlePlain = async () => {
    let res = await fetch(assetPath)
    let buf = await res.arrayBuffer()
    // expose buffer to decode alternate encodings in console
    // (new TextDecoder("windows-1251")).decode(window.buf)
    window.buf = buf
    let text = (new TextDecoder("utf-8")).decode(buf)
    setDatum(text)
  }

  const handleDoc = async () => {
    try {
      let html = await toHtml(assetPath)
      let blob = new Blob([html])
      let blobURL = URL.createObjectURL(blob)
      setDocPath(blobURL)
    } catch(e) {
      console.log("handleDoc failed:", e)
    }
  }

  useEffect(() => {
    // set local copy of event, why? TODO
    if(typeof newEvent !== 'undefined') {
      setEvent(newEvent)
    }

    // reset sidebar contents on event switch
    setDatum("")
    setAssetPath(undefined)
    setDocPath(undefined)
    window.buf = {}


    // assign assetPath on local
    if ((process.env.REACT_APP_BUILD_MODE === "local")) {
      resolvePathLocal(newEvent)
    }
    if (isIFrameable(newEvent?.FILE_PATH) && window.localStorage.getItem('antea_public')) {
      resolvePathLFS("", newEvent)
    }
  }, [newEvent])

  return (
    <div
      className={cn(
        styles.sidebar,
        { [styles.invisible]: !event },
      )}
    >
      <div className={styles.container}>
        <div className={styles.sticky}>
          <Title>{formatDate(event?.HOST_DATE)} {eventIndex}</Title>
          <Button type="button" onClick={handleClose}>X</Button>
          { (process.env.REACT_APP_BUILD_MODE === "local") && (
            <div>
              <Button type="button" onClick={handlePlain}>????</Button>
              <Button type="button" onClick={handleDoc}>????</Button>
              {assetPath && (
                <Paragraph>
                  <Link href={assetPath} target="_blank" rel="noreferrer">{assetPath}</Link>
                </Paragraph>
              )}
              {/* <Paragraph>{event?.UUID}</Paragraph> */}
            </div>
          )}
          {event?.DATUM && (
            <Paragraph>{event?.DATUM}</Paragraph>
          )}
          <Paragraph>{datum}</Paragraph>
          { (process.env.REACT_APP_BUILD_MODE !== "local") &&
            (!window.localStorage.getItem('antea_public')) &&
            isIFrameable(event?.FILE_PATH) && (
              <Button type="button" onClick={async () => {await resolvePathLFS(window.prompt('key'))}}>Show source</Button>
          )}
          {isIFrameable(event?.FILE_PATH) && assetPath && (
            <Paragraph><iframe title="iframe" src={assetPath} width="100%" height="800px"></iframe></Paragraph>
          )}
          { (process.env.REACT_APP_BUILD_MODE === "local") && docPath && (
            <Paragraph><iframe title="iframe" src={docPath} width="100%" height="800px"></iframe></Paragraph>
          )}
          <div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
