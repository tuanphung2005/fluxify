# Architecture Charts

This folder contains PlantUML source files for Fluxify architecture documentation.

## Structure

- charts/shared: Common style and legend includes.
- charts/c4: C4 style architecture views.
- charts/uml: UML behavior and domain views.

## C4 Diagrams

- c4-01-system-context.puml: System context with primary actors and external services.
- c4-02-container-view.puml: Container-level boundaries across UI, API, auth, and data.
- c4-03-order-processing-components.puml: Order processing subsystem component interactions.
- c4-04-shop-builder-components.puml: Shop builder subsystem components and data flow.
- c4-05-chat-components.puml: Chat subsystem and unread polling interactions.
- c4-06-vendor-admin-components.puml: Vendor and admin management subsystem interactions.

## UML Diagrams

- uml-01-domain-class-model.puml: Core domain model and cardinal relationships.
- uml-02-backend-package-diagram.puml: Backend package dependency map.
- uml-03-checkout-sequence.puml: Customer checkout and order transaction flow.
- uml-04-vendor-operations-sequence.puml: Vendor dashboard operational request flow.
- uml-05-auth-registration-sequence.puml: Registration, verification, and login sequence.
- uml-06-product-lifecycle-activity.puml: Product creation and update workflow.
- uml-07-order-state-machine.puml: Order lifecycle status transitions.
- uml-08-shop-template-lifecycle-activity.puml: Shop template editing and publish workflow.

## Validation

If PlantUML is installed locally, run a syntax-only check:

```powershell
Get-ChildItem charts -Recurse -Filter *.puml | ForEach-Object { plantuml -checkonly $_.FullName }
```
