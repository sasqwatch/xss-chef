import React from 'react'
import { SortableElement, SortableHandle } from 'react-sortable-hoc'
import * as Recipes from '~/recipes'

class CookBookItem extends React.Component {
  constructor (props) {
    super(props)

    this.loadItem = this.loadItem.bind(this)
    this.getStateClassName = this.getStateClassName.bind(this)
  }

  loadItem () {
    if (!this.props.cookBook || !this.props.id) {
      return {}
    }

    let item = this.props.cookBook.find(i => i.id === this.props.id)

    return {
      recipe: Recipes[item.className],
      instance: item
    }
  }

  getStateClassName (isValid) {
    if (!isValid) {
      return 'has-error'
    } else if (this.props.disabled) {
      return 'disabled'
    } else {
      return 'enabled'
    }
  }

  disableRecipe (id) {
    if (this.props.disableRecipe) {
      this.props.disableRecipe(id)
    }
  }

  render () {
    let item = this.loadItem()
    let recipe = item.recipe
    let instance = item.instance
    let isValid = recipe && recipe.validate(instance)

    return (
      <div className={ this.getStateClassName(isValid) }>
        <div className="recipe-title">
          { recipe.title }
        </div>

        { recipe.render(instance) }
      </div>
    )
  }
}

export default CookBookItem
