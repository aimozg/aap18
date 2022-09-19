/*
 * Created by aimozg on 20.07.2022.
 */

import {Component, createRef, h} from "preact";

export class AppendNode extends Component<{ child:Node }, any>{

	private ref = createRef<HTMLDivElement>();

	componentDidMount() {
		this.ref.current!.parentNode!.insertBefore(this.props.child, this.ref.current!.nextSibling);
		this.ref.current!.remove();
	}
	componentWillUnmount() {
		this.props.child.parentNode?.removeChild(this.props.child)
	}
	shouldComponentUpdate(): boolean {
		return false;
	}

	protected fragment = document.createDocumentFragment()

	render() {
		return <div style="display:none" ref={this.ref}></div>
	}
}

