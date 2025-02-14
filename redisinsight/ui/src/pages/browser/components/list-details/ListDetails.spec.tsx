import React from 'react'
import { mock } from 'ts-mockito'
import { act, fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import ListDetails, { Props } from './ListDetails'

const mockedProps = mock<Props>()

const elements = [
  { element: { type: 'Buffer', data: [49] }, index: 0 },
  { element: { type: 'Buffer', data: [50] }, index: 1 },
  { element: { type: 'Buffer', data: [51] }, index: 2 },
]

jest.mock('uiSrc/slices/browser/list', () => {
  const defaultState = jest.requireActual('uiSrc/slices/browser/list').initialState
  return {
    listSelector: jest.fn().mockReturnValue(defaultState),
    updateListValueStateSelector: jest
      .fn()
      .mockReturnValue(defaultState.updateValue),
    listDataSelector: jest.fn().mockReturnValue({
      ...defaultState,
      total: 3,
      key: { type: 'Buffer', data: [49] },
      keyName: { type: 'Buffer', data: [49] },
      elements,
    }),
    fetchListElements: jest.fn(),
    fetchSearchingListElementAction: jest.fn,
    setListInitialState: jest.fn,
  }
})

describe('ListDetails', () => {
  it('should render', () => {
    expect(render(<ListDetails {...mockedProps} />)).toBeTruthy()
  })

  it('should render rows properly', () => {
    const { container } = render(<ListDetails {...mockedProps} />)
    const rows = container.querySelectorAll(
      '.ReactVirtualized__Table__row[role="row"]'
    )
    expect(rows).toHaveLength(elements.length)
  })

  it('should render search input', () => {
    render(<ListDetails {...mockedProps} />)
    expect(screen.getByTestId('search')).toBeTruthy()
  })

  it('should call search', () => {
    render(<ListDetails {...mockedProps} />)
    const searchInput = screen.getByTestId('search')
    fireEvent.change(searchInput, { target: { value: '111' } })
    expect(searchInput).toHaveValue('111')
  })

  it('should render editor after click edit button', async () => {
    render(<ListDetails {...mockedProps} />)
    await act(() => {
      fireEvent.click(screen.getAllByTestId(/edit-list-button/)[0])
    })
    expect(screen.getByTestId('element-value-editor')).toBeInTheDocument()
  })

  it('should render resize trigger for index column', () => {
    render(<ListDetails {...mockedProps} />)
    expect(screen.getByTestId('resize-trigger-index')).toBeInTheDocument()
  })
})
