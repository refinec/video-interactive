import Vue from "vue";
import {
    Button,
    Row,
    Col,
    Input,
    Slider,
    Notification,
    Menu,
    MenuItem,
    Form,
    FormItem,
    CheckboxGroup,
    Checkbox,
    Select,
    Option,
    Radio,
    RadioGroup,
    Empty,
    Loading,
} from "element-ui";

Vue.use(Button);
Vue.use(Row);
Vue.use(Col);
Vue.use(Input);
Vue.use(Slider);
Vue.use(Menu);
Vue.use(MenuItem);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(CheckboxGroup);
Vue.use(Checkbox);
Vue.use(Select);
Vue.use(Option);
Vue.use(RadioGroup);
Vue.use(Radio);
Vue.use(Empty);
Vue.prototype.$notification = Notification;
Vue.prototype.$loading = Loading;
