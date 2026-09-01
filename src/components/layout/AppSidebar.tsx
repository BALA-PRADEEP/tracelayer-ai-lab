import { PRIMARY_NAVIGATION, type PrimaryNavigationItem } from "../../constants/navigation";

interface AppSidebarProps {
  active: PrimaryNavigationItem;
  onNavigate: (item: PrimaryNavigationItem) => void;
}

export default function AppSidebar({ active, onNavigate }: AppSidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brandBlock">
        <div className="brandMark">B</div>
        <div>
          <strong>BuildPilot</strong>
          <span>Construction operations</span>
        </div>
      </div>

      <nav className="sideNav" aria-label="Primary">
        {PRIMARY_NAVIGATION.map((item) => (
          <button
            key={item}
            className={active === item ? "navItem navItemActive" : "navItem"}
            type="button"
            onClick={() => onNavigate(item)}
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="sidebarFooter">
        <div className="userAvatar">BP</div>
        <div>
          <strong>Bala Pradeep</strong>
          <span>Project manager</span>
        </div>
      </div>
    </aside>
  );
}
