import React from 'react'
import { shallow } from 'enzyme'
import PayloadPanel from './PayloadPanel'

describe('<PayloadPanel />', () => {
  const cookBookDouble = [{
    id: 'DummyRecipe_0001',
    className: 'DummyRecipe',
    exports: { recipe1: true }
  }, {
    id: 'DummyRecipe_0002',
    className: 'DummyRecipe',
    exports: { recipe2: true }
  }, {
    id: 'DummyRecipe_0003',
    className: 'DummyRecipe',
    exports: { recipe3: true }
  }]

  let wrapper

  beforeEach(() => {
    global.cookCallback = jest.fn()
    wrapper = shallow(
      <PayloadPanel cookBook={cookBookDouble} />
    )
  })

  afterAll(() => {
    delete global.cookCallback
  })

  it('should not render children', () => {
    const wrapper = shallow(
      <PayloadPanel cookBook={cookBookDouble}>
        <div className="test"></div>
      </PayloadPanel>
    )

    expect(wrapper.find('div.test')).toHaveLength(0)
  })

  describe('if all items in `props.cookBook` are valid', () => {
    it('should call the `cook` method of each recipe in `props.cookBook`', () => {
      expect(global.cookCallback).toHaveBeenCalledTimes(3)
    })

    describe('when multiple recipes are present', () => {
      it('should invoke `cook` with the `vars` returned from the previous recipe', () => {
        expect(global.cookCallback).toHaveBeenNthCalledWith(1, cookBookDouble[0], {
          payload: '__XSS_CHEF_ENTRY_POINT__'
        })

        expect(global.cookCallback).toHaveBeenNthCalledWith(2, cookBookDouble[1], {
          payload: 'Cooked DummyRecipe_0001',
          recipe1: true
        })

        expect(global.cookCallback).toHaveBeenNthCalledWith(3, cookBookDouble[2], {
          payload: 'Cooked DummyRecipe_0001 DummyRecipe_0002',
          recipe2: true
        })
      })
    })

    it('should render the final payload as text', () => {
      expect(wrapper.find('textarea').props().value).toEqual(
        'Cooked DummyRecipe_0001 DummyRecipe_0002 DummyRecipe_0003'
      )
    })
  })

  describe('if any item in `props.cookBok` is invalid', () => {
    it('should not call the `cook` method of any recipe', () => {
      const cookBookDouble = [{
        id: 'DummyRecipe_0001',
        className: 'DummyRecipe'
      }, {
        id: 'DummyRecipe_0002',
        className: 'DummyRecipe'
      }, {
        id: 'DummyRecipe_0003',
        className: 'DummyRecipe',
        valid: false
      }]

      global.cookCallback = jest.fn()
      wrapper = shallow(
        <PayloadPanel cookBook={cookBookDouble} />
      )

      expect(global.cookCallback).toHaveBeenCalledTimes(0)
    })
  })

  describe('if one or more recipes have dependencies', () => {
    it('should include a single copy of each dependency in the final payload', () => {
      const cookBook = [{
        id: 'DummyRecipe_0001',
        className: 'DummyRecipe2',
        exports: { recipe1: true }
      }, {
        id: 'DummyRecipe_0002',
        className: 'DummyRecipe2',
        exports: { recipe2: true }
      }, {
        id: 'DummyRecipe_0003',
        className: 'DummyRecipe2',
        exports: { recipe3: true }
      }]

      const wrapper = shallow(
        <PayloadPanel cookBook={cookBook} />
      )

      const payload = wrapper.find('textarea').props().value
      const functionCount = (payload.match(/function ajaxRequest/g) || []).length
      expect(functionCount).toEqual(1)
    })
  })
})
