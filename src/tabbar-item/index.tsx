import { computed, getCurrentInstance } from 'vue';
import { TABBAR_KEY, TabbarProvide } from '../tabbar';

// Utils
import { createNamespace, isObject } from '../utils';

// Composition
import { useParent } from '@vant/use';
import { routeProps, useRoute } from '../composables/use-route';

// Components
import Icon from '../icon';
import Badge from '../badge';

const [createComponent, bem] = createNamespace('tabbar-item');

export default createComponent({
  props: {
    ...routeProps,
    dot: Boolean,
    icon: String,
    name: [Number, String],
    badge: [Number, String],
    iconPrefix: String,
  },

  emits: ['click'],

  setup(props, { emit, slots }) {
    const route = useRoute();
    const vm = getCurrentInstance()!.proxy!;
    const { parent, index } = useParent<TabbarProvide>(TABBAR_KEY);

    if (!parent) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[Vant] TabbarItem must be a child component of Tabbar.');
      }
      return;
    }

    const active = computed(() => {
      const { route, modelValue } = parent.props;

      if (route && '$route' in vm) {
        const { $route } = vm;
        const { to } = props;
        const config = isObject(to) ? to : { path: to };
        const pathMatched = 'path' in config && config.path === $route.path;
        const nameMatched = 'name' in config && config.name === $route.name;

        return pathMatched || nameMatched;
      }

      return (props.name || index.value) === modelValue;
    });

    const onClick = (event: MouseEvent) => {
      parent.setActive(props.name ?? index.value);
      emit('click', event);
      route();
    };

    const renderIcon = () => {
      if (slots.icon) {
        return slots.icon({ active: active.value });
      }
      if (props.icon) {
        return <Icon name={props.icon} classPrefix={props.iconPrefix} />;
      }
    };

    return () => {
      const { dot, badge } = props;
      const { activeColor, inactiveColor } = parent.props;
      const color = active.value ? activeColor : inactiveColor;

      return (
        <div
          class={bem({ active: active.value })}
          style={{ color }}
          onClick={onClick}
        >
          <Badge dot={dot} content={badge} class={bem('icon')}>
            {renderIcon()}
          </Badge>
          <div class={bem('text')}>
            {slots.default?.({ active: active.value })}
          </div>
        </div>
      );
    };
  },
});
