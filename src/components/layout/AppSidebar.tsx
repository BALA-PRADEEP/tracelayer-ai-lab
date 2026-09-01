import type { PrimaryNavigationItem } from "../../constants/navigation";

interface AppSidebarProps {
  active: PrimaryNavigationItem;
  onNavigate: (item: PrimaryNavigationItem) => void;
}

const sections: Array<{ label: string; items: Array<{ name: PrimaryNavigationItem; icon: string }> }> = [
  { label: "", items: [{ name: "Overview", icon: "⌂" }] },
  { label: "Work", items: [{ name: "Projects", icon: "▣" }, { name: "Estimates", icon: "◫" }] },
  { label: "Operations", items: [{ name: "Procurement", icon: "⇄" }] },
  { label: "Business", items: [{ name: "Customers", icon: "◎" }, { name: "Finance", icon: "$" }] },
];

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
        {sections.map((section) => (
          <div className="navSection" key={section.label || "home"}>
            {section.label && <span className="navSectionLabel">{section.label}</span>}
            {section.items.map((item) => (
              <button
                key={item.name}
                className={active === item.name ? "navItem navItemActive" : "navItem"}
                type="button"
                onClick={() => onNavigate(item.name)}
                aria-current={active === item.name ? "page" : undefined}
              >
                <span className="navIcon" aria-hidden="true">{item.icon}</span>
                <span>{item.name === "Overview" ? "Home" : item.name === "Procurement" ? "Purchasing" : item.name}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebarFooter">
        <div className="userAvatar">BP</div>
        <div>
          <strong>Bala Pradeep</strong>
          <span>Project manager</span>
        </div>
        <button className="profileMore" type="button" aria-label="Account menu">•••</button>
      </div>
    </aside>
  );
}
