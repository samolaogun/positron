_ = require 'underscore'
React = require 'react'
ReactDOM = require 'react-dom'
Autocomplete = null
{ label, input, div, button } = React.DOM

module.exports = (el, props) ->
  ReactDOM.render React.createElement(AutocompleteSection, props), el

module.exports.AutocompleteSelect = AutocompleteSection = React.createClass

  getInitialState: ->
    loading: true, value: null, id: null

  clear: ->
    debugger
    @setState { value: null }, =>
      # Deferring to focus after render happens
      _.defer =>
        debugger
        $(@refs.input).focus()
    @props.cleared()

  removeAutocomplete: ->
    @autocomplete?.remove()

  componentDidUpdate: ->
    return unless not @state.loading and not @state.value
    console.log 'remove addAutocomplete'
    # @autocomplete?.remove()
    @addAutocomplete()

  addAutocomplete: ->
    console.log 'in addAutocomplete'
    Autocomplete ?= require '../autocomplete/index.coffee'
    @autocomplete = new Autocomplete _.extend _.pick(@props, 'url', 'filter'),
      el: $(@refs.input)
      selected: (e, item) =>
        # Deferring because of click race condition
        _.defer =>
          @setState value: item.value, id: item.id
          @removeAutocomplete()
        @props.selected? e, item

  render: ->
    hidden = input { type: 'hidden', value: @state.id || '', name: @props.name }
    if @state.loading
      label { className: 'bordered-input-loading' }, @props.label,
        input { className: 'bordered-input' }
        hidden
    else if @state.value
      label {}, @props.label,
        div { className: 'autocomplete-select-selected' }, @state.value,
          button { className: 'autocomplete-select-remove', onClick: @clear }
        hidden
    else
      label {}, @props.label,
        input {
          ref: 'input'
          className: 'bordered-input'
          placeholder: @props.placeholder
        }
        hidden