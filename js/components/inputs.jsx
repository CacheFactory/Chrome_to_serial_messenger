var Inputs = React.createClass({
  getInitialState: function() {
    return {functionName: "",
            arg1: "",
            arg2: "",
            arg3: "" };
  },

  makeValueLink: function(key) {
    var self = this;
    return {
      value: this.state[key],
      requestChange: function(newValue) {
        var newState = {};
        newState[key] = newValue;
        self.setState(newState);
      }
    }
  },

  createItem: function(item){
    return <option value={item}>{item}</option>
  },
  onSend: function(event){
    event.preventDefault();
    this.props.sendCallback(this.state);
  },
  render: function() {

    return (
      <form>
        <label>
          Function name
        </label>
        <input type="text" valueLink={this.makeValueLink('functionName')} />
        <br/>

        <label>
          Arg 1
        </label>
        <input type="text" valueLink={this.makeValueLink('arg1')} />
        <br/>

        <label>
          Arg 2
        </label>
        <input type="text" valueLink={this.makeValueLink('arg2')} />
        <br/>

        <label>
          Arg 3
        </label>
        <input type="text" valueLink={this.makeValueLink('arg3')} />
        <br/>

        <button onClick={this.onSend }>SEND</button>
      </form>
    );
  }
});