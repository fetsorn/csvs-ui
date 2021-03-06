import { useEffect, useState, createRef } from 'react'
import { graphviz } from "@hpcc-js/wasm";
import { Header } from '@components'
import Draggable from 'react-draggable'
import { fetchDataMetadir } from '@utils'
import { ged2dot, ged2dot_ } from '@fetsorn/ged2dot'
import styles from './Tree.module.css'

async function dot2svg(dot) {

  // render dot notation with graphviz
  var svg = await graphviz.layout(dot, "svg", "dot")

  return svg
}

const Tree = () => {
  const [data, setData] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [html, setHtml] = useState("")
  const [depth, setDepth] = useState(4)
  const [root, setRoot] = useState("F0001")
  const [isTree, setIsTree] = useState(false)
  const rootInput = createRef()

  const render = async (_root = root, _depth = depth) => {
    let dot = ged2dot(data, _root, _depth)
    let svg = await dot2svg(dot)
    setHtml(svg)
  }

  const reloadPage = async () => {

    setIsLoading(true)

    try {
      let index = await fetchDataMetadir("index.ged")
      setData(index)
      let dot = ged2dot_(index)
      let svg = await dot2svg(dot)
      setHtml(svg)
      setIsTree(true)
    } catch(e1) {
      console.log(e1)
      try {
        let index = await fetchDataMetadir("index.html")
        setHtml(index)
      } catch (e2) {
        console.log(e2)
      }
    }
    setIsLoading(false)
  }

  useEffect( () => {
    reloadPage()
  }, [])

  return (
    <>
      <Header reloadPage={reloadPage}/>
      { isLoading && (
        <p>Loading...</p>
      )}
      {isTree && (
        <div style={{backgroundColor: "white"}}>
          <input type="text"
                 ref={rootInput}
                 id="rootInput"
                 value={root}
                 onChange={async (e) => {
                   setRoot(rootInput.current.value)
                   await render(rootInput.current.value, depth)
                 }}/>
          <div>Depth: {depth}</div>
          <input type="range"
                 min="1" max="10"
                 value={depth}
                 onChange={async (e) => {
                   setDepth(e.target.value)
                   await render(root, e.target.value)
                 }}/>
        </div>
      )}
      <div className={styles.container}>
        <Draggable cancel='.node'>
          <div className={styles.csv} dangerouslySetInnerHTML={{ __html: html }}>
          </div>
        </Draggable>
      </div>
    </>
  )
}

export default Tree
