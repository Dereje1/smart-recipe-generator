import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import Loading from "../../../src/components/Loading";
 
describe('The Loading spinner', () => {
  it('renders', () => {
    const { container } = render(<Loading />)
    expect(container).toMatchSnapshot()
  })
})