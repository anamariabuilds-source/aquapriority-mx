import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { INCIDENTS } from "@/data/incidents";

const flyTo = vi.fn();

vi.mock("react-leaflet", () => ({
  useMap: () => ({ flyTo }),
  MapContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TileLayer: ({ eventHandlers }: { eventHandlers: { tileerror: () => void } }) => <button type="button" onClick={eventHandlers.tileerror}>Simular fallo de mosaico</button>,
  Polygon: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Popup: ({ children }: { children: ReactNode }) => <span>{children}</span>,
  CircleMarker: ({ children, eventHandlers }: { children: ReactNode; eventHandlers: { click: () => void } }) => <button type="button" aria-label="marcador ficticio" onClick={eventHandlers.click}>{children}</button>,
}));

import IncidentMap from "@/components/incident-map";

describe("interactive fictional incident map", () => {
  beforeEach(() => flyTo.mockClear());

  it("renders eight interactive markers and preserves accessible list selection", () => {
    const onSelect = vi.fn();
    render(<IncidentMap incidents={INCIDENTS} selectedId={INCIDENTS[0].id} onSelect={onSelect} />);
    expect(screen.getAllByLabelText("marcador ficticio")).toHaveLength(8);
    fireEvent.click(screen.getAllByLabelText("marcador ficticio")[1]);
    expect(onSelect).toHaveBeenCalledWith(INCIDENTS[1].id);
    fireEvent.click(screen.getByRole("button", { name: `8. ${INCIDENTS[7].id}` }));
    expect(onSelect).toHaveBeenCalledWith(INCIDENTS[7].id);
  });

  it("focuses the selected table incident and shows a tile failure fallback", () => {
    const { rerender } = render(<IncidentMap incidents={INCIDENTS} selectedId={INCIDENTS[0].id} onSelect={() => undefined} />);
    rerender(<IncidentMap incidents={INCIDENTS} selectedId={INCIDENTS[3].id} onSelect={() => undefined} />);
    expect(flyTo).toHaveBeenLastCalledWith([...INCIDENTS[3].coordinates], 13, { duration: 0.6 });
    fireEvent.click(screen.getByRole("button", { name: "Simular fallo de mosaico" }));
    expect(screen.getByRole("alert")).toHaveTextContent("lista accesible permanece funcional");
  });
});
