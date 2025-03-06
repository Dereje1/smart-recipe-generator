import Features from "../../../src/components/Hero_Sections/Features";
import { render } from '@testing-library/react'

it('The Features section renders', () => {
    const { container } = render(<Features resetPage={()=>({})}/>)
    expect(container).toMatchSnapshot()
})