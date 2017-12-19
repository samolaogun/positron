import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { uniq } from 'lodash'
import Icon from '@artsy/reaction-force/dist/Components/Icon'

export class Autocomplete extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    filter: PropTypes.func,
    formatResult: PropTypes.func,
    items: PropTypes.array,
    onSelect: PropTypes.func,
    placeholder: PropTypes.string,
    url: PropTypes.string
  }

  state = {
    results: [],
    loading: false
  }

  componentDidMount = () => {
    if (this.textInput) {
      this.addAutocomplete()
    }
  }

  addAutocomplete = () => {
    const { url, filter } = this.props

    const returnItems = (items) => {
      return items.results.map((item) => {
        return {
          _id: item.id,
          title: item.title,
          thumbnail_image: item.thumbnail_image
        }
      })
    }

    this.engine = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      remote: {
        url,
        filter: filter || returnItems,
        ajax: {
          beforeSend: () => {
            this.setState({ loading: true })
          },
          complete: () => {
            this.setState({ loading: false })
          }
        }
      }
    })
    this.engine.initialize()
  }

  search = (value) => {
    if (this.engine.remote.url !== this.props.url) {
      this.engine.remote.url = this.props.url
    }
    this.engine.get(value, (results) => {
      this.setState({ results })
    })
  }

  onSelect = (item) => {
    const { onSelect, items } = this.props
    items.push(item._id)
    onSelect(uniq(items))
    this.onBlur()
  }

  onBlur = () => {
    if (this.textInput) {
      this.textInput.blur()
      this.textInput.value = ''
    }
    this.setState({ results: [] })
  }

  isFocused = () => {
    return this.textInput === document.activeElement
  }

  formatResult (item) {
    return (
      <div className='Autocomplete__item'>
        <div className='Autocomplete__item-img'>
          {item.thumbnail_image &&
            <img src={item.thumbnail_image || ''} />
          }
        </div>
        <div className='Autocomplete__item-title'>
          {item.title}
        </div>
      </div>
    )
  }

  formatResults = () => {
    const { formatResult } = this.props
    const { loading, results } = this.state

    if (results.length) {
      return results.map((item, i) =>
        <div
          key={i}
          className='Autocomplete__result'
          onClick={() => this.onSelect(item)}
        >
          {formatResult
            ? <div className='Autocomplete__item'>
                {formatResult(item)}
              </div>

            : this.formatResult(item)
          }
        </div>
      )
    } else if (loading) {
      return (
        <div className='Autocomplete__item Autocomplete__item--loading'>
          <div className='loading-spinner' />
        </div>
      )
    } else {
      return <div className='Autocomplete__item Autocomplete__item--empty'>No results</div>
    }
  }

  renderResults = () => {
    if (this.isFocused()) {
      // display if input is focused
      return (
        <div className='Autocomplete__results'>
          <div className='Autocomplete__results-list'>
            {this.formatResults()}
          </div>
          <div
            className='Autocomplete__results-bg'
            onClick={this.onBlur}
          />
        </div>
      )
    }
  }

  render () {
    const { disabled, placeholder } = this.props

    return (
      <div className='Autocomplete'>
        <Icon
          name='search'
          color='black'
          className='Autocomplete__icon'
        />
        <input
          className='Autocomplete__input bordered-input'
          disabled={disabled}
          onChange={(e) => this.search(e.target.value)}
          placeholder={placeholder}
          ref={(input) => {
            this.textInput = input
          }}
        />
        {this.renderResults()}
      </div>
    )
  }
}