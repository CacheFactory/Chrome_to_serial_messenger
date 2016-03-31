var DropDown = React.createClass({
  createItem: function(item){
    return <option key={item} value={item}>{item}</option>
  },
  onChange: function(event){
    this.props.selectedCallback(event.target.value)
  },
  render: function() {
    console.log(this)
    return (
      <div>
        <select onChange={this.onChange}> {this.props.items.map(this.createItem)} </select>
        
        <Inputs sendCallback={this.props.sendCallback} />

      </div>
    );
  }
});