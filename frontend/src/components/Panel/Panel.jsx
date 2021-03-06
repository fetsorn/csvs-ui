import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from "react-router-dom"
import { Button, DropdownMenu } from '@components'
import { paramsToObject, objectToParams } from './utils'
import styles from './Panel.module.css'

const Panel = ({ schema: rawSchema, worker, reloadPage }) => {
  const [params, setParams] = useState({})
  const [options, setOptions] = useState({})
  const navigate = useNavigate()

  const addField = (prop) => (
    () => {
      const searchParams = new URLSearchParams(window.location.search)
      const value = searchParams.has(prop) ? searchParams.get(prop) : ""

      console.log(options)
      console.log(addedFields)
      setParams({ ...params, [prop]: value })
    }
  )

  const removeField = (prop) => (
    () => {
      const newParams = { ...params }
      delete newParams[prop]
      setParams(newParams)
    }
  )

  const onChangeField = (prop) => (
    (e) => {
      const newParams = {...params}
      newParams[prop] = e.target.value
      setParams(newParams)
    }
  )

  const search = async () => {
    const searchParams = objectToParams(params)

    navigate({
      pathname: window.location.pathname,
      search: "?" + searchParams.toString()
    })

    await reloadPage()
  }

  const schema = useMemo(() => (
    Object.keys(rawSchema).reduce((acc, key) => (
      rawSchema[key]?.hasOwnProperty('parent') // without root of schema
        ? [...acc, { ...rawSchema[key], name: key }]
        : acc
    ), [])
  ), [rawSchema])

  const notAddedFields = useMemo(() => (
    schema.filter((item) => !params?.hasOwnProperty(item.name))
  ), [schema, params])

  const addedFields = useMemo(() => (
    Object.keys(params).reduce((acc, key) => (
      rawSchema[key]?.hasOwnProperty('parent')
        ? [ ...acc, { key, value: params[key] }]
        : acc
    ), [])
  ), [params, rawSchema])

  const menuItems = useMemo(() => (
    notAddedFields.map((field) => (
      { label: field.name, onClick: addField(field.name) }
    ))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [notAddedFields])

  useEffect(() => (
    (async () => {
      var _options = {}
      for (const param of schema) {
        _options[param.name] = await worker.queryOptions(param.name)
      }
      setOptions(_options)
    })()
  ), [schema])

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    setParams(paramsToObject(searchParams))
  }, [])

  return (
    <>
      <form className={styles.form}>
        {addedFields.map(({ key, value }) => (
          <div>
            <label>{key}</label>
            <span onClick={removeField(key)}>  X</span>
            <br/>
            <input
              className={styles.input}
              type="text"
              list={`${key}_list`}
              value={value}
              placeholder={key}
              onChange={onChangeField(key)}
            />
            <datalist id={`${key}_list`}>
              {options[key]?.map(option => (
                <option value={option}/>
              ))}
            </datalist>
          </div>
        ))}
      </form>
      <DropdownMenu
        label=''
        menuItems={menuItems}
      />
      <Button type="button" onClick={search}>Search</Button>
    </>
  )}

export default Panel
