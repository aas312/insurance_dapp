import { drizzleConnect } from 'drizzle-react'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ipfs from '../../../ipfs.js'
import PolicyInterface from './../../../../build/contracts/Policy.json'

/*
 * Create component.
 */

class CreatePolicyForm extends Component {
  constructor(props, context) {
    super(props);

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.contracts = context.drizzle.contracts;

    // Get the contract ABI
    const abi = this.contracts.PolicyManager.abi;

    this.inputs = [];
    var initialState = {};

    // Iterate over abi for correct function.
    for (var i = 0; i < abi.length; i++) {
        if (abi[i].name === 'createPolicy') {
            this.inputs = abi[i].inputs;

            for (var i = 0; i < this.inputs.length; i++) {
                initialState[this.inputs[i].name] = '';
            }

            break;
        }
    }

    initialState['buffer'] = ''
    initialState['showSpinner'] = false
    this.state = initialState;
  }

  captureFile = (event) => {
        event.stopPropagation()
        event.preventDefault()
        const file = event.target.files[0]
        let reader = new window.FileReader()
        reader.readAsArrayBuffer(file)
        reader.onloadend = () => this.convertToBuffer(reader)
      };
  convertToBuffer = async(reader) => {
      //file is converted to a buffer for upload to IPFS
        const buffer = await Buffer.from(reader.result);
      //set this buffer -using es6 syntax
        this.setState({buffer});
    };

  handleUpload = async (event) => {
    this.setState({ showSpinner: true });
    event.preventDefault();
    await ipfs.add(this.state.buffer, (err, ipfsHash) => {
      //setState by setting ipfsHash to ipfsHash[0].hash
      this.setState({ _coverageTermsHash:ipfsHash[0].hash, showSpinner: false });
    })
  };

  handleSubmit() {
    (async () => {
      let receipt = await this.contracts.PolicyManager.methods.createPolicy(this.state._name, this.state._price, this.state._coveragePeriod, this.state._maxClaim, this.state._coverageTerms, this.state._coverageTermsHash).send({from: this.props.accounts[0], value: this.props.value});
      let policy = receipt.events.AddPolicy.returnValues.policy
      var contractConfig = {
        contractName: policy,
        web3Contract: new this.context.drizzle.web3.eth.Contract(PolicyInterface.abi, policy)
      }

      await this.context.drizzle.addContract(contractConfig)
      await this.props.loadPolicies()

      this.setState({
        _name: '',
        _price: '',
        _coveragePeriod: '',
        _maxClaim: '',
        _coverageTerms: '',
        _coverageTermsHash: '',
      })

    })()

  }

  handleInputChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  translateType(type) {
    switch(true) {
        case /^uint/.test(type):
            return 'number'
            break
        case /^string/.test(type) || /^bytes/.test(type):
            return 'text'
            break
        case /^bool/.test(type):
            return 'checkbox'
            break
        default:
            return 'text'
    }
  }

  render() {
    return (
      <form className="pure-form pure-form-stacked">
        {this.inputs.map((input, index) => {
            var inputType = this.translateType(input.type)
            var inputLabel = this.props.labels ? this.props.labels[index] : input.name
            // check if input type is struct and if so loop out struct fields as well
            return (<input key={input.name} type={inputType} name={input.name} value={this.state[input.name]} placeholder={inputLabel} onChange={this.handleInputChange} />)
        })}
        <p>Optionally store terms in file on IPFS.</p>
        <input type="file" onChange={this.captureFile} />
        {this.state.buffer && !this.state._coverageTermsHash &&
          <div>
            <button key="upload" className="pure-button" type="button" onClick={this.handleUpload}>Upload File to IPFS</button>
            <br/>
          </div>
        }
        {this.state.showSpinner &&
          <p> 🔄 </p>
        }
        <br/>
        <button key="submit" className="pure-button" type="button" onClick={this.handleSubmit}>Submit</button>
      </form>
    )
  }
}

CreatePolicyForm.contextTypes = {
  drizzle: PropTypes.object
}

/*
 * Export connected component.
 */

const mapStateToProps = state => {
  return {
    contracts: state.contracts,
    accounts: state.accounts
  }
}

export default drizzleConnect(CreatePolicyForm, mapStateToProps)
