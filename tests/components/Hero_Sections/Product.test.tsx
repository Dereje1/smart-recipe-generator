import Product from "../../../src/components/Hero_Sections/Product";
import { render } from '@testing-library/react'

it('The Product section renders', () => {
    const { container } = render(<Product resetPage={()=>({})}/>)
    expect(container).toMatchSnapshot()
})