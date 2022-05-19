import React from 'react'
import PropTypes from 'prop-types'
import {colors} from '../../styles'
import DropdownMenu from '../Menus/DropdownMenu'
//import Tag from '../Pill/Tag'
import ValidationError from './ValidationError'
import ServerError from './ServerError'
import TextFieldHint from './TextFieldHint'
import FloatingLabel from './FloatingLabel'
import SVGIcon from '../SVGIcon'
import {defaultTheme} from '../../styles/themer/utils'
import spacing from '../../styles/spacing'
import { capitalize } from '../../helpers'
import {Tag, KIND, VARIANT} from 'baseui/tag';

/* eslint jsx-a11y/no-noninteractive-tabindex: 0 */

const styles = {
  root: {
    display: 'inline-block',
    position: 'relative',
    width: '343px',
  },
  triggerContainer: {
    borderRadius: '4px',
    position: 'relative',
  },
  trigger: {
    backgroundColor: '#FFF',
    border: `solid 1px ${colors.GRAY_74}`,
    borderRadius: '4px',
    boxSizing: 'border-box',
    color: colors.GRAY_20,
    fontSize: '16px',
    minheight: '56px',
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
    paddingTop: '25px',
    paddingRight: '25px',
    paddingBottom: spacing.XS,
    paddingLeft: spacing.XS,
    outline: 'none',
    position: 'relative',
    WebkitOpacity: 1,
    WebkitTapHighlightColor: 'rgba(0,0,0,0)',
    ':hover': {
      cursor: 'pointer',
    },
  },
  triggerDisabled: {
    border: `1px dashed ${colors.GRAY_74}`,
    backgroundColor: colors.GRAY_93,
    color: colors.GRAY_46,
    ':hover': {
      cursor: 'not-allowed',
    },
  },
  menu: {
    width: '100%',
  },
  iconContainer: {
    display: 'flex',
    flexDirection: 'column',
    userSelect: 'none',
    position: 'absolute',
    right: '8px',
    top: '18px',
  },
  icon: {
    transition: 'transform 100ms',
    userSelect: 'none',
  },
  iconError: {
    color: colors.RED_700,
  },
  iconOpen: {
    transform: 'rotate(180deg)',
  },
  iconDisabled: {
    color: colors.GRAY_46,
  },
  labelContainer: {
    // whiteSpace: 'nowrap',
    // textOverflow: 'ellipsis',
    // overflow: 'hidden',
    // userSelect: 'none',
    // display: 'inline-block',
    display: 'flex',
    flexWrap: 'wrap',
  },
  floatingLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    ':hover': {
      cursor: 'pointer',
    },
  },
  error: {
    border: `1px solid ${colors.RED_700}`,
    backgroundColor: '#FDE6EB',
  },
  fullWidth: {
    width: '100%',
  },
  halfWidth: {
    width: '162px',
  },
}

const noOp = () => {} // eslint-disable-line no-empty-function

const getSnackStyles = (snacksTheme) => {
  const {action} = snacksTheme.colors
  return {
    highlight: {
      border: `1px solid ${action}`,
    },
    icon: {
      color: action,
    },
  }
}
const INITIAL_STATE = {
  list: [],
};
class Select extends React.PureComponent {
  static propTypes = {
    /** Name of the field */
    name: PropTypes.string.isRequired,
    /** Children are passed to Menu and should be MenuItems or MenuDivider */
    bottomMenu: PropTypes.shape({
      label: PropTypes.string,
      link: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.bool,
      ]),
    }),
    children: PropTypes.node,
    /** DefaultOption */
    defaultOption: PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.bool,
      ]),
    }),
    /** Disable the text field */
    disabled: PropTypes.bool,
    /** Text of label that will animate when TextField is focused */
    floatingLabelText: PropTypes.string,
    /** Sets width to 100% */
    fullWidth: PropTypes.bool,
    /** Sets width to 162px */
    halfWidth: PropTypes.bool,
    /** FormComponent error for validation */
    hasError: PropTypes.bool,
    /** Hint text will show up when the Select is open and there is no value */
    hintText: PropTypes.string,
    /** Uniq id for Select */
    id: PropTypes.string,
    /** Handled by FormComponent after running built in validations */
    isValid: PropTypes.bool,
    open: PropTypes.bool,
    /** onOpen callback */
    onOpen: PropTypes.func,
    /** onClose callback */
    onClose: PropTypes.func,
    /** onFocus callback */
    onFocus: PropTypes.func,
    /** onSelect callback returns option object {label: , value:} */
    onSelect: PropTypes.func,
    /** onSelect callback returns option object {label: , value:} */
    onRemove: PropTypes.func,
    /** onBlur callback */
    onBlur: PropTypes.func,
    /** Mark the field as required.  */
    required: PropTypes.bool,
    /** Has edits boolean.  */
    hasEdit: PropTypes.bool,
    /** Control the component selection manually */
    selectedOption:PropTypes.array, 
    //selectedOption: PropTypes.shape({
    //   label: PropTypes.string,
    //   value: PropTypes.oneOfType([
    //     PropTypes.string,
    //     PropTypes.number,
    //     PropTypes.bool,
    //   ]),
    // }),
    /** Error from server to show ServerError message */
    serverError: PropTypes.string,
    /** Wrapper styles, mainly used for custom width */
    style: PropTypes.object,
    /** Text to show for validation error  */
    validationErrorText: PropTypes.string,
  }

  static defaultProps = {
    disabled: false,
    defaultOption: null,
    onFocus: noOp, // eslint-disable-line no-empty-function
    onBlur: noOp, // eslint-disable-line no-empty-function
    onOpen: noOp, // eslint-disable-line no-empty-function
    onClose: noOp, // eslint-disable-line no-empty-function
    onSelect: noOp, // eslint-disable-line no-empty-function
  }

  state = {
    isOpen: false,
    selectedOption:
      (this.props.defaultOption&&[this.props.defaultOption]) 
      || (this.props.selectedOption&&[this.props.selectedOption])
      || [],
  }
  componentDidMount(){
   // alert("mounted")
    const {selectedOption} = this.props
    

      
    if (selectedOption?.length) {
this.setState({selectedOption})
    }
  }
  componentWillUnmount() {
  //  alert("un mounted")
  //  console.log('selectedOptionWillReceiveProps')
  //  console.log(selectedOption)
    this.setState({selectedOption:[]})
  }

  componentWillReceiveProps(nextProps) {


    const {selectedOption} = nextProps
    console.log('selectedOption')
    console.log(selectedOption)
    if (selectedOption instanceof Array) {
      this.setState({selectedOption})
    }
  }
  

  getValue = () => {
    return (
      (this.state.selectedOption.length && this.state.selectedOption) || []
    )
  }

  handleClose = () => {
    this.trigger.focus()
    this.props.onClose()
  }

  handleRequestChange = (open) => {
   // alert('change')
    if (!this.props.disabled) {
      this.setState({isOpen: open})
    }
  }

  handleFocus = (e) => {
    this.setState({isFocused: true}, () => {
      this.props.onFocus(e)
    })
  }

  handleBlur = (e) => {
   // alert('blur')
    this.setState({isFocused: false}, () => {
      this.props.onBlur(e)
    })
    
  }
  block = (e) => {
    e.stopPropagation()
    e.preventDefault()
  }
  handleSelect = (e, option) => {
    const {onSelect, selectedOption} = this.props

    const _option = [...this.state.selectedOption, option]
    // For manual control
    if (!selectedOption?.length) {
      this.setState({selectedOption: _option}, () => {
        onSelect(e, _option)
      })
    } else {
      onSelect(e, _option)
    }
  }
  onClearArray = () => {
    this.setState({ selectedOption: [] });
  };
 
  onResetArray = () => {
    this.setState({ ...INITIAL_STATE });
  };
   

  onRemoveItem = (e, value) => {
    const {onSelect} = this.props
    //this.trigger.focus()
    this.setState(state => {
      const selectedOption = state.selectedOption.filter(item => item.value !== value);
      onSelect(e, selectedOption)
      return {
        selectedOption,
        isFocused: false,
        isOpen: false
      };
    });
  };

  renderTrigger() {
    const {
      disabled,
      required,
      hasError,
      hintText,
      floatingLabelText,
      hasEdit
    } = this.props

    const snacksStyles = getSnackStyles(defaultTheme)

    const {isOpen, selectedOption, isFocused} = this.state
    const hasValue = !!selectedOption?.length
    const showHintText = hintText && !hasValue && isOpen

    return (
      <div
          onClick={this.block}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          tabIndex={0}
          role='button'
          ref={(node) => (this.trigger = node)}
        >
        <div
        onClick={this.block}
          className={(hasEdit&&!isFocused)?`has-edits`:''}
          style={{
            ...styles.trigger,
            ...(disabled && styles.triggerDisabled),
            ...((isOpen || isFocused) && !hasError && snacksStyles.highlight),
            ...(!disabled && hasError && styles.error),
          }}
          //className='has-edits'

          aria-required={required}
          aria-invalid={hasError}>
          <FloatingLabel
          onClick={this.block}
            text={floatingLabelText}
            float={isOpen || hasValue}
            disabled={disabled}
            isActive={isOpen || isFocused}
            hasError={hasError}
            style={styles.floatingLabel}
            snacksTheme={defaultTheme}
          />

          <div style={styles.labelContainer}>
            {hintText && (
              <TextFieldHint
                text={hintText}
                show={showHintText}
                disabled={disabled}
                onClick={this.block}
                style={styles.floatingLabel}
              />
            )}



            {/* {selectedOption && selectedOption.label} */}
            {Boolean(selectedOption?.length) 
            ? selectedOption.map((x,i)=>
              <Tag
                key={i}
                //kind={KIND.accent}
                //label={capitalize(x.label)}
                
                overrides={{
                  Root: {
                    style: ({ $theme }) => ({
                      zIndex:8
                    })
                  }
                }}
                value={x.value}
                //e.stopPropagation()
                onActionClick={(e)=>{x.value !== 'ALL_PRODUCTS' && ((e.stopPropagation()),(e.preventDefault()),(this.onRemoveItem(e, x.value)))}}
                //onClick={(e)=>x.value === 'ALL_PRODUCTS' && ((alert('try')),(this.onRemoveItem(e, x.value)))}
                variant={VARIANT.solid}
                closeable={x.value !== 'ALL_PRODUCTS'}
              >
               {capitalize(x.label)} 
              </Tag>)
            :<wbr/>
          }

          </div>

          <div style={styles.iconContainer}
                  // onFocus={this.handleFocus}
                  // onBlur={this.handleBlur}
                  // tabIndex={0}
                  // role='button'
                  // ref={(node) => (this.trigger = node)}
          
          >
            <SVGIcon
              name='arrowDownSmall'
              color={disabled?styles.iconDisabled.color:snacksStyles.icon.color}
              style={{
                ...styles.icon,
                ...snacksStyles.icon,
                ...(isOpen && styles.iconOpen),
                ...(disabled && styles.iconDisabled),
                ...(!disabled && hasError && styles.iconError),
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  render() {
    const {
      children,
      disabled,
      id,
      isValid,
      halfWidth,
      fullWidth,
      onOpen,
      serverError,
      style,
      validationErrorText,
      bottomMenu,
      hasEdit,
      open
    } = this.props

    const {isOpen} = this.state

    return (
      <div
        style={{
          ...styles.root,
          ...(fullWidth && styles.fullWidth),
          ...(halfWidth && styles.halfWidth),
          ...style,
        }}>
        <div>
          {serverError && !disabled && !isValid && (
            <ServerError text={serverError} />
          )}
          

          <DropdownMenu
            {...{bottomMenu}}
            triggerElement={this.renderTrigger()}
            open={isOpen}
            onRequestChange={this.handleRequestChange}
            onSelect={this.handleSelect}
            menuProps={{style: styles.menu}}
            onClose={this.handleClose}
            //open={typeof open === 'boolean'?open:undefined}
           // onClick={()=>alert('cool')}
            onOpen={onOpen}>
            {children}
          </DropdownMenu>
            <div style={{minHeight:21}}>

            
          <ValidationError
            text={validationErrorText}
            show={!disabled && !isValid && !serverError}
            inputId={id}
          />
          </div>
        </div>
      </div>
    )
  }
}

export default Select
